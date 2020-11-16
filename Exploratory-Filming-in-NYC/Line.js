class Line {

    constructor(state, setGlobalState) {
        // initialize properties here
        this.width = window.innerWidth * 0.5;
        this.height = window.innerHeight * 0.6;
        this.margins = { top: 5, bottom: 30, left: 40, right: 5 };
        this.duration = 1000;
    
        this.svg = d3
          .select("#line-chart")
          .append("svg")
          .attr("width", this.width)
          .attr("height", this.height);
      }

     draw(state, setGlobalState) {
        console.log("now I am drawing my LINE graph");
        
        console.log(state.lineData)

        const showbyData = state.lineData.filter(d => d.Filter=== state.showby )
        console.log(showbyData)
        
        let filteredData=showbyData
        if (state.showby=== "Borough" ){
            filteredData= showbyData.filter(d => d.Name === state.selectedBorough)
        }
        else if (state.showby=== "Category") {
            filteredData= showbyData.filter(d => d.Name === state.selectedCategory)
        }
        else if (state.showby=== "Type") {
            filteredData= showbyData.filter(d => d.Name === state.selectedType)
        }
        console.log(filteredData)

        const xScale = d3
            .scaleTime()
            .domain(d3.extent(showbyData,d=>d.Month))
            .range([this.margins.left, this.width - this.margins.right])
        console.log(d3.extent(filteredData,d=>d.Month))

        const yScale = d3
            .scaleLinear()
            .domain([0,d3.max(showbyData, d => d.Events)])
            .range([this.height - this.margins.top, this.margins.bottom]);
        
        const lineFunc = d3.line()
                .x(d=>xScale(d.Month))
                .y(d=>yScale(d.Events)) 

        
        const xAxis = this.svg.append("g")
                .attr("transform", "translate(0," + (this.height-this.margins.bottom) + ")")
                .attr("class", "x-axis")
                .call(d3.axisBottom(xScale)
                    .ticks(d3.timeMonth)
                    .tickSize(5,0) 
                    .ticks(5)
                    .tickFormat(d3.timeFormat("%Y")))
        let yAxis = this.svg.append("g")
                .attr("transform", "translate(40," + (-this.margins.bottom) + ")")
                .attr("class", "y-axis")
                .transition()
                .duration(1000)
                .call(d3.axisLeft(yScale))
 

        console.log(state)
/*         yScale.domain([0, d3.max(filteredData, d => d.Events)]);

        d3.select("g.y-axis")
        .transition()
        .duration(1000)
        .call(yAxis.scale(yScale)); */
       console.log([filteredData])

/*        
        const line = this.svg
            .selectAll("path.trend")
            .data([filteredData])
            .join(
                enter =>
                enter
                    .append("path")
                    .attr("class", "trend")
                    .attr("stroke", "white")
                    .attr("stroke-width",1)
                    .attr("opacity", 0)
                    .call(enter => enter.append("path")),
                update => update,
                exit => exit.remove()
            ) 
            .call(selection =>
                selection
                  .transition() // sets the transition on the 'Enter' + 'Update' selections together.
                  .duration(1000)
                  .attr("opacity", 1)
                  .attr("d", lineFunc())
              );

            
        line.select("path")
            .transition()
            .duration(this.duration)
            .attr("d",d=>valueLine(d)) */


        const dot = this.svg
            .selectAll("dot")
            .data(filteredData)
            .join(
                enter =>
                enter
                    .append("g")
                    .attr("class", "dot")
                    .call(enter => enter.append("circle")),
                update => update,
                exit =>
                    exit.call(exit =>
                    // exit selections -- all the `.dot` element that no longer match to HTML elements
                    exit
                        .transition()
                        .duration(500)
                        .remove()
                    )
                ) 
                .on("mouseover", function(d) {                                                            
                    //Get this bar's x/y values, then augment for the tooltip

 /*                    console.log(d3.event.pageX, d3.event.pageY)
                    xPosition = d3.event.pageX -100;
                    yPosition = d3.event.pageY - 20; */
                    //Update the tooltip position and value
                    d3.select("#tooltip")
                            .style("left", d3.event.pageX  + "px")
                            .style("top", d3.event.pageY + "px")						
                            .select("#events")
                            .text(d.Events)
                            .style("fill", "white")
                    d3.select("#tooltip")       
                            .select("#month")
                            .text(d3.timeFormat("%B")(d.Month))
                            .style("fill", "white")
                    d3.select("#tooltip")       
                            .select("#year")
                            .text(d3.timeFormat("%Y")(d.Month))
                            .style("fill", "white")
                    d3.select("#tooltip")       
                            .select("#tooltipheader")
                            .text(d.Name)
                            .style("fill", "white")
                    //Show the tooltip
                    d3.select("#tooltip").classed("hidden", false);
                    })  
                .on("mouseleave", function(d) {
                      d3.select("#tooltip").classed("hidden", true);
                    })  

        dot.select("circle")
        .transition()
        .duration(this.duration)
        .attr("transform", "translate(0," + (-this.margins.bottom) + ")")
        .attr("r", 6)
        .attr("cx", d => xScale(d.Month))
        .attr("cy", d => yScale(d.Events)) // initial value - to be transitioned
        .attr("fill", "#DDDDDD")
        .attr("fill-opacity", 0.5)
        


      }

    }


export { Line };