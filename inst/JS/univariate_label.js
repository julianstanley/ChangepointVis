// !preview r2d3 data=c(-0.138, -0.6253, 0.5587)
//
// r2d3: https://rstudio.github.io/r2d3
//
var data = r2d3.data;
var labels = new Array(data.data_set.length).fill('normal');

const accent_colour = "#4363d8"; //blue
const base_colour = "#c5c5c5"; //Grey
const secondary_colour = "#f58231"; //orange

const colour_1 = "#2c7bb6";
const colour_2 = "#00a6ca";
const colour_3 = "#00ccbc";
const colour_4 = "#d7191c";


var parentDiv = document.getElementById("main_output");
var margin = {top: 20, right: 20, bottom: 110, left:40};
var margin2 = {top: 390, right: 20, bottom: 30, left: 40};
var width = parentDiv.clientWidth - margin.left - margin.right;
var height = parentDiv.clientHeight - margin.top - margin.bottom;
var height2 = parentDiv.clientHeight - margin2.top - margin2.bottom;

var width_padding = 20;
var height_padding = 20;

var x = d3.scaleLinear().range([0 + width_padding, width - width_padding]).nice(),
    y = d3.scaleLinear().range([height - height_padding, 0 + height_padding]).nice();

var label_scale = d3.scaleLinear().domain([width_padding,width-width_padding]).range([0, data.data_set.length]);

//console.log(width);

var xAxis = d3.axisBottom(x),
    yAxis = d3.axisLeft(y);

div.style("height", "90%");

var div = div.style("background", "none");

var main_plot = div
  .append("svg")
  .attr("class", "main")
  .style("width", "100%")
  .style("height", "100%")
  .style("border-radius", "4px")
  .style("box-shadow", "0px 18px 40px -12px rgba(196,196,196,0.35)")
  .style("background", "#ffffff")
  .style("margin", "10px");

var focus = main_plot.append("g")
    .attr("class", "focus")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

x.domain(d3.extent(data.data_set, function(d, i) { return i; })).nice();
y.domain([d3.min(data.data_set), d3.max(data.data_set)]).nice();

var line = d3.line()
            .x(function(d, i) { return x(i); })
            .y(function(d) { return y(d); });

focus.append("path")
          .datum(data.data_set)
          .attr("class", "main-line")
          .attr("fill", "none")
          .attr("stroke", accent_colour)
          .attr("d", line);

focus.call( d3.brushX()
        .extent( [ [width_padding, height_padding], [width-width_padding, height - height_padding] ] )
        .on("end", updateChart)
      );


function updateChart() {

      var annotations = [];
      var positions = [];
      var min = [];
      var max = [];
      var form = document.getElementById("label-type");
      var form_val;
    	for(var i=0; i<form.length; i++){
    	    if(form[i].checked){
            form_val = form[i].id;
    	    }
    	   }

    extent = d3.event.selection;
    var range = d3.extent(extent, function(d) { return Math.round(label_scale(d)) });
    for (i = range[0] ; i< range[1]; i++){
        labels[i] = form_val;
    }

    //console.log(labels);
    focus.selectAll(".class_rect").remove();
    focus.selectAll(".overlay").remove();
    focus.selectAll(".selection").remove();
    focus.selectAll(".handle").remove();

    r_data = annotationData(labels, annotations, min, max, positions);

    focus.selectAll("bar")
      .data(labels)
      .enter()
      .append("rect")
      .attr("class", "class_rect")
      .attr("x", function(d, i) { return x(i) })
      .attr("y", height_padding)
      .attr("height", (height - (height_padding * 2)))
      .attr("width", (width-width_padding) / data.data_set.length)
      .attr("fill", function(d) {
        if(d === "normal") { return "#ffffff"}
        if(d === "multiple_breakpoints") {return colour_1}
        if(d === "breakpoint") {return colour_4}
      })
      .style("opacity", "0.2")
      .style("stroke", "none");

      focus.call( d3.brushX()
        .extent( [ [width_padding, height_padding], [width-width_padding, height - height_padding] ] )
        .on("end", updateChart));

}

var button = d3.select(".send_data")
              .on("click", function(){
                //console.log(JSON.stringify(r_data));
                  Shiny.setInputValue(
                    "data_sent",
                    JSON.stringify(r_data),
                    {priority: "event"}
                    )});

var dropdown = d3.select("#segmentselect")
              .on("change", function(){
                //console.log(d3.select(this).property("value"));
                  Shiny.setInputValue(
                    "segmentnumber",
                    d3.select(this).property("value"),
                    {priority: "event"}
                    )});

function annotationData(labels, annotations, min, max, positions) {
      for (i = 0; i < labels.length; i++) {
        if(labels[i] != labels[i+1]) {
          annotations.push(labels[i])
          positions.push(i)
          }
      }

      for (i = 0; i < positions.length; i++) {
        if (i === 0){
          min[i] = 0
          max[i] = positions[i]
        }
        else {
          min[i] = (positions[i-1] + 1)
          max[i] = positions[i]
        }
      }

      tmp_data = []
      for (i = 0; i < annotations.length; i++) {
        var tmp = {id:1, subset:1, min:min[i], max:max[i], annotation:annotations[i] };
        //console.log(tmp)
        tmp_data.push(tmp);
      }
      return tmp_data
}

r2d3.onRender(function(data) {

  if (data.predictions[0] === "NULL") {

  } else {
  focus.selectAll(".predictedChangepoints").remove();


  focus.selectAll("bar")
      .data(data.predictions)
      .enter()
      .append("rect")
      .attr("class", "predictedChangepoints")
      .transition()
      .duration(300)
      .attr("x", function(d) { return x(d) })
      .attr("y", height_padding)
      .attr("height", (height - (height_padding * 2)))
      .attr("width", 2)
      .attr("fill", "#000000")
      .style("opacity", "1")
      .style("stroke", "none");
  }

})

focus.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

focus.append("text")
      .attr("transform", "translate(" + (width/2) + " ," + (height + margin.top + 5) + ")")
      .style("text-anchor", "middle")
      .attr("font-size", "2rem")
      .text("Time")
      .style("color", "#000000");

focus.append("g")
      .attr("class", "axis axis--y")
      .call(yAxis);

focus.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0- margin.left/18)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .attr("font-size", "2rem")
      .text("Value")
      .style("color", "#000000");
