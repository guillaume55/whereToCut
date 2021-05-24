# whereToCut
A webpage to know how to cut standard bars into cuts for welded assemblies or aluminium extrusion strutures

## Limitations
For now, if you have more than one type of bar (différent height), you have to do several calculation. We assume you work with square profiles. If not, enter the right height to fit the angle you need

##TODO
* Add export to PDF
* Correct the change of value in field when we add a bar
* Make a script to group every files in only one (To allow downloading only one file and use it without installation and store it in the Desktop folder)
* Check data before processing
* Show angles in the results
* Clean code 

## Computation method 

### With right angles
1. Sort the bars and the cuts for the longest to the shortest
2. Loop bars
    1. Try to fit the longest remaining cut ...
    2. .... and the second longest ...

3. Prepare results graphically

### With differents angles

1. Sort the bars and the cuts for the longest to the shortest
2. Check if we can optimize by grouping two cuts with the same angle (if two diff cuts have an equal angle)
3. Check if the length we can potentially save by grouping cuts with angles is longer than the shortest cut
4. Now two solutions : 
    *. Not optimizable : Ignore angles and try with the standard way
    *. Optimizable : Try to fit with angles



3. Prepare results graphically

