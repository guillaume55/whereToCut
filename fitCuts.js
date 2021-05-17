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
    res += "</div>"
    return res
    }
    return "No remaining part"
}


