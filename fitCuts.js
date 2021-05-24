function sortBars(items){
    var i
    items.sort(function (a, b) {
      return b.len - a.len;
    });

    return items
}

//take the cuts and try to fit them in the given bar
function fitCutsInBar(len, cuts) {
    var j, ratio
    var cutsLen = cuts.length
    var items = []
    
    for(j=0; j<cutsLen; j++)  {
        cut = cuts[j]['len']
        
        if(len - cut >= 0) {
            len = len - cut
            items.push(cut)      
        }
    }
    return items
}

//find the loss of a bar (sumOfCuts / initailLength)
function computeRatio(initLen, bar)  {
    if(bar.length == 0 ) {
        return 0 //0% of the bar is cuted
    }
    sum = bar.reduce((a, b) => {
        return a + b;
    });
    //percentage of the bar which has been cuted
    return (sum / initLen) *100 
}

//return the items of arr1 that are not is ar2
function arrayDiff(ar1, ar2) {
    var newAr1 = []
    var i, ar1Len
    ar1Len = ar1.length

    for(i=0; i<ar1Len; i++)  {
        if(ar2.indexOf(ar1[i]['len']) == -1)  {
            newAr1.push(ar1[i])
            ar2.splice(ar2.indexOf(ar1[i]['len']),1)
        }
            
    }
    return newAr1
}

//place longest cut in longest bar first
function fitCutsStandard(bars, cuts){
    var i, barLen, bar
    barLen = bars.length

    var res = []
    for(i=0; i<barLen; i++)  {
        bar = fitCutsInBar(bars[i]['len'], cuts)
        var cutsInBar = [].concat(bar)
        ratio = computeRatio(bars[i]['len'], bar)
        console.log("cutsIn bar1",cutsInBar)
        cuts = arrayDiff(cuts, bar)
        console.log("cuts 2",cutsInBar)
        res.push({len:bars[i]['len'], cuts: cutsInBar, ratio: ratio})     
        
    }
    return {bars:res, remainingCuts: cuts}
}
/************** Bars with angles ******************/

function areThereAngles(cuts){
    var i
    var angles = [], res = []
    //search for angles and store them in an array
    for(i=0; i<cuts.length; i++)  {
        console.log(cuts)
        if(cuts[i]['angle1'] % 90 != 0) {  //angle found --> array add
            angles.push(cuts[i]['angle1'])
        }
        if(cuts[i]['angle2'] % 90 != 0 && cuts[i]['angle1'] != cuts[i]['angle2'])  { //if there is the same angle on both side, enter only one data (we won't be able to optimize if there is only two45° cut for example if there are on the same bar)
            angles.push(cuts[i]['angle2'])
        }
    }
    //if on angle is present more than once, we may optimize the cuts
    for(i=0; i<angles.length; i++)
    {
        //if value is present more than one time = optimization ?
        if (angles.indexOf(angles[i]) != angles.lastIndexOf(angles[i])) {
            //put the angle only one time
            if(res.indexOf(angles[i]) == -1) { res.push(angles[i]) }
        }
    }
    console.log("angles to optimize", res)
    return res;
}

function fitCutsInBarOptim(len, cuts, angles) {
    var j, ratio
    var cutsLen = cuts.length
    var items = []
    
    for(j=0; j<cutsLen; j++)  {
        cut = cuts[j]['len']
        
        if(len - cut >= 0) {
            len = len - cut
            items.push(cut)      
        }
    }
    return items
}

//is that useful to optim ? if we can earn less than the shortest cut --> not very usefull
function maxOptimLength(bars, cuts, anglesToOptim) {
    var optimizedLength = 0,i
    anglesToOptim.forEach(function(angle){
        var count = 0
        for(i=0; i< cuts.length; i++){
            if(cuts[i]['angle1'] == angle || cuts[i]['angle2'] == angle) {
                count += 1
            }
        }
        if(count > 1) { //at least two cuted bars with the same angle
            var h = bars[0]['height']  //all are supposed to be the same
            /*
                ↑ |\
              h ↓ |_\ angle a here  --> l = h/ tan(a)
                    l
            */
            optimizedLength += (h / Math.tan(angle * (3.1415 / 180) ))*(count-1)  //deg to rad
            console.log(angle, "OL", optimizedLength)
        }
    }); 

    return optimizedLength

} 

function fitCutsAngle(bars, cuts, angles){
    //group the cuts with two sides with the same angle
    var i, cutsWithTwoEqualAngles = []
    var cutsWithAngles = []
    for(i=0; i<angles.length; i++) {
        cutsWithTwoEqualAngles = cuts.filter(function (e) {
            return e.angle1 == angle && e.angle2 == angle;
        });
        console.log("two = angles",cutsWithTwoEqualAngles)
        
        cutsWithTwoDiffAngles = cuts.filter(function (e) {
            
            return (e.angle1 == angle && e.angle2 != angle) || (e.angle1 != angle && e.angle2 == angle);
        });
        console.log("two != angles",cutsWithTwoDiffAngles)
        cutsWithAngles.push({"twoEq":  cutsWithTwoEqualAngles,"twoDiff": cutsWithTwoDiffAngles})
    }

    /*Now, there will be so much possibilities : 
        Method A - Sort the bars and place them by length
            eg : longest bar with an alpha angles will be placed before the longest bar with a beta angle
                    --> (a°/500mm/25°)(25°/400mm/45°)(45°/300mm/b°)
        Method B - Sort the bars and place them by angles
            eg : cuts with the sam angle from the longest to the shortest and then, another angle if possible
                    --> (a°/500mm/45°)(45°/400mm/45°)(45°/300mm/25°)(25°/500mm/25°)(25°/400mm/25°)(25°/300mm/b°)
                        or    
                                                                    ↓                                       
                    --> (a°/500mm/45°)(45°/400mm/45°)(45°/300mm/25°)(60°/500mm/60°)(60°/400mm/60°)(60°/300mm/b°)
                                                                    ↑ Try another angle because we cannot chain those
        - Different possibilities to place the angled cuts near non angled cuts (before, between, after)
*/
    //Now we will try to chain bars with method A
    //We will combine as much as posible cuts and integrate them between the other cuts (longest first)
    var i, barLen, bar
    barLen = bars.length

    var res = []
    for(i=0; i<barLen; i++)  {
        /*bar = fitCutsInBar(bars[i]['len'], cuts)
        var cutsInBar = [].concat(bar)
        ratio = computeRatio(bars[i]['len'], bar)
        console.log("cutsIn bar1",cutsInBar)
        cuts = arrayDiff(cuts, bar)
        console.log("cuts 2",cutsInBar)
        res.push({len:bars[i]['len'], cuts: cutsInBar, ratio: ratio})   */  
        bar = fitCutsInBarOptim(bars[i]['len'], cuts, cutsWithAngles)
    }
    return {bars:res, remainingCuts: cuts}

}



/*****************  SHOW BARS AND DATA ***************/
function graphBar(bar, initLen)  {
    var i,  width

    res = "<div class='res-bar'>"

    for(i=0; i<bar['cuts'].length; i++)  {
        width = ( (bar['cuts'][i]/initLen)*100 ).toString();
        res += '<div class="res-cut" style="width:'+width+'%;">'+bar['cuts'][i] +'</div>'
    }

    res += "</div>"

    return res
    
}

function graphRes(bars)  {
    var i, res, loss
    
    res = "<div class='res-bars'>"
    for(i=0; i<bars.length; i++)  {
        loss = 100-bars[i]['ratio'].toString()
        res += '<div class="res-barLen">Bar: '+bars[i]['len']+'mm, Loss:'+loss+ '%</div>'
        res+= graphBar(bars[i], bars[i]['len'])
         
        
    }
    res += "</div>"

    return res
}

function showRemainingCuts(cuts) {
    var i, res =""
    if(cuts.length > 0) {
    res = "<div class='res-remaining'>It remains: "
    for(i=0; i<cuts.length; i++)  {
        res += '<div class="res-rem">'+cuts[i]['len'].toString()+'</div>'
        
    }
    res += "</div></br>Delimiter<input id='delimiter' value =','><button onclick='exportToCsv()'> Download CSV </button>  "
    return res
    }
    return "No remaining part</br>Delimiter<input id='delimiter' value =','><button onclick='exportToCsv()'> Download CSV </button>"
}

/****************  EXPORTS  ********************/
/*
CSV STRUCTURE
Bars1 Length    Ratio(used/initialLength)  Cut 1   Cut 2   Cut x   
Bars2 Length    Ratio(used/initialLength)  Cut 1   Cut 2   Cut x   
Barsx Length    Ratio(used/initialLength)  Cut 1   Cut 2   Cut x   
Remaning        Cut 1   Cut 2   Cut x

*/
function exportToCsv() {
    res = finalRes
    bars = res['bars']
    cuts = res['cuts']
    remaining = res['remainingCuts']
    var delimiter = document.getElementById('delimiter').value
    //write bars
    var csv = 'Bar Length' + delimiter + 'Ratio'+ delimiter + 'Cuts\n'
    bars.forEach(function(item) {
        var c = "", i
        for(i=0; i<item['cuts'].length; i++){ c += delimiter + item['cuts'][i].toString(); console.log(c)}
        csv += item['len'].toString() + delimiter + item['ratio'].toString() + c +'\n'
    });
    //write remaining cuts
    csv += '\nRemaining cuts'
    remaining.forEach(function(item) {
        csv += delimiter + item.toString()  
    });

    var hiddenElement = document.createElement('a');  
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);  
    hiddenElement.target = '_blank';  
      
    //provide the name for the CSV file to be downloaded  
    hiddenElement.download = 'Cuts.csv';  
    hiddenElement.click();    
} 

