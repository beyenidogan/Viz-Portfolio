export function Details() {
  /**
  * CONSTANTS AND GLOBALS
  * */
  const margin = { top: 20, bottom: 50, left: 70, right: 40 };
  let svg,nest,xScale2,yScale2,xAxis2,xAxis3,yAxis2,filteredData,formatNumber;
  const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.55,
  paddingInner = 0.1,duration = 1000
  /**
   * APPLICATION STATE
   * */
  let state = {
    showstats: null,
    selectedshow: "All Shows",
    selectedMetric: "Weekly Grosses",
  };

  /**
   * LOAD DATA
   * */
d3.csv("./data/BroadwayWeeklyStats.csv", d3.autoType) 
  .then(raw_data => {
    console.log("raw_data", raw_data);
//    filter;
    state.showstats=raw_data;
    console.log("state: ", state);

    init();
  });

  /**
   * INITIALIZING FUNCTION
   * */
  function init() {

    state.showstats
      .sort((a, b) => (d3.ascending(a.Show, b.Show)))

    const selectShow = d3.select("#showsdropdown")
      .on("change", function() {
        state.selectedshow = this.value;
        console.log("new selected show is", state.selectedshow);
        draw(); 
      });
      
    selectShow 
      .selectAll("option")
      .data([...Array.from(new Set(state.showstats.map(d => d.Show))), 
        ])
      .join("option")
      .attr("value", d => d)
      .text(d => d);
    
    const selectMetric = d3.select("#showsdropdown2")
      .on("change", function() {
          state.selectedMetric = this.value;
          console.log("new selected metric is", state.selectedMetric);
          draw(); 
      });

    selectMetric
      .selectAll("option")
      .data(["Weekly Grosses","Weekly Total Attendance","Percent Capacity","Number of Performances"])
      .join("option")
      .attr("value", d => d)
      .text(d => d);      

    svg = d3
      .select("#part3-graph")
      .append("svg")
      .attr("class","svg")
      .attr("width", width)
      .attr("height", height);
    
    xScale2 = d3
      .scaleTime()
      .domain(d3.extent(state.showstats,d=>d.WeekEnd))
      .range([margin.left, width - margin.right])
    
    yScale2 = d3
      .scaleLinear()
      .domain([0,d3.max(state.showstats, d => d[state.selectedMetric])])
      .range([height - margin.bottom, margin.top])
   //  .range([this.height - this.margins.top, this.margins.bottom]);
    
    xAxis2 = d3.axisBottom(xScale2).tickFormat(d3.timeFormat("%b")).ticks(20)
    xAxis3 = d3.axisBottom(xScale2).tickFormat(d3.timeFormat("%y")).ticks(4)

    yAxis2 = d3.axisLeft(yScale2)
    
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis3)
      .selectAll(".tick text")
      .style("font-size","11px")
      .attr("class", "years")
      .attr("dy", "2em")

    svg
      .append("g")
      .attr("class", "x-axis2")
      .style("font-size","11px")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis2)    
    svg
      .append("g")
      .attr("class", "y-axis2")
      .style("font-size","11px")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis2)
    
    draw()
  }

  /**
   * DRAW FUNCTION
   * we call this everytime there is an update to the data/state
   * */
  function draw() {
  
    filteredData = state.showstats    
    console.log("state.selectedshow",state.selectedshow)

    filteredData = state.showstats.filter(d => d.Show === state.selectedshow);
  
    console.log("filtereddata",filteredData)

    console.log("state.selectedMetric",state.selectedMetric)
   
    if (state.selectedMetric==="Weekly Grosses") {formatNumber= d3.format("$,")}
    else if (state.selectedMetric==="Weekly Total Attendance"||state.selectedMetric==="Number of Performances") {formatNumber=d3.format(",")}
    else if (state.selectedMetric==="Percent Capacity"){ formatNumber=d3.format(".0%")}
 
    //if (values = valuesByKey.get(keyValue = key(value = array[i]) + ""))
    
    yScale2.domain([0,d3.max(filteredData, d => d[state.selectedMetric])])
    
    yAxis2
    .tickFormat(formatNumber);

    d3.select("g.y-axis2")
    .transition()
    .duration(1000)
    .call(yAxis2.scale(yScale2))

    let lineFunc= d3.line()
      .x(d=> xScale2(d.WeekEnd))
      .y(d=> yScale2(+d[state.selectedMetric]))

    let datapoints=filteredData.length
    console.log("datapoints",datapoints)

    const line = svg
        .selectAll("path.trend")
        .data([filteredData])
        .join(
          enter =>
            enter
            .append("path")
            .attr("class", "trend")
            .attr("stroke-width",1)
            .attr("opacity", 0),
          update => update,
          exit => exit.remove()
        )

      line.transition() 
      .duration(duration/2)
            .attr("opacity", 1)
            .attr("stroke", "grey")
            .attr("fill","none")
            .attr("d", lineFunc)

      const hiddendots = svg
        .selectAll("g.hiddendots")
        .data(filteredData,d=>`${d.Show}`)
        .join(
          enter =>
            enter          
            .append("g")
            .attr("class", "hiddendots")

            .call(enter => enter.append("circle")),
          update => update,
          exit => exit.remove()
        )
      
      hiddendots
            .selectAll("circle")
            .attr("opacity",0)
            .attr("x",d=>xScale2(d.WeekEnd))
            .attr("y",d=>yScale2(+d[state.selectedMetric]))
            .transition() 
            .duration(duration/10)
             .attr(
              "transform",
              d => `translate(${xScale2(d.WeekEnd)}, ${yScale2(+d[state.selectedMetric])})`
            ) 
            .attr("stroke", "grey")
            .attr("fill","white")
           // .attr("opacity", datapoints<2? 1 : 0)
            .attr("opacity",0.4)
            .attr("r",2)
      

    hiddendots
    .on("mouseover", function(d) {                                                            
      console.log(d3.event.pageX)
      d3.select("#tooltip3")     
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY) + "px")        
      d3.select("#tooltipheader3")
          .text(d.Show)
      d3.select("#weekendattr")
          .text("Week Ending: ")
      d3.select("#weekending")
          .text(d3.timeFormat("%B %d, %Y")(d.WeekEnd))
      d3.select("#selectedMetric")
          .text(state.selectedMetric+" :")
      d3.select("#MetricValue")
          .text(formatNumber(d[state.selectedMetric]))
      d3.select("#Showtype2")
          .text(d.Type===null? "": "Type : ")
      d3.select("#Showtype2name")
          .text(d.Type===null? "": d.Type)
      d3.select("#Rerun")
          .text(d.Run===null? "": "Rerun/Original: ")
      d3.select("#RerunValue")
          .text(d.Run)
      d3.select("#RerunY")
          .text(d.RerunYear===null? "": "Version: ")
      d3.select("#RerunYear")
          .text(d.RerunYear)
      d3.select("#PlayedAt")
          .text(d.Theatre===null? "": "Theater: ")
      d3.select("#TheaterName")
          .text(d.Theatre)

      d3.select(this)
            .transition()
            .duration('50')
            .attr('fill-opacity', '1')
            .attr("fill","white")
            .attr("stroke-width","1.5")
            .attr ("r", 5)   
      d3.select("#tooltip3").classed("hidden", false);
      })  
    .on("mouseleave", function(d) {
      d3.select("#tooltip3").classed("hidden", true);
      
      })  

  }
}