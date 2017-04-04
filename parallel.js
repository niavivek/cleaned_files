
<!-- Ref: http://bl.ocks.org/ABSegler/9791707 -->

var dset = "times_2016_top30.csv";
startD3();
var yearSelector = function (event) {
  var element = document.getElementById("year");
  var selectedValue = element.options[element.selectedIndex].text;

    if (selectedValue == "2016") {
      dset = "times_2016_top30.csv";
      startD3();
    }
    else if (selectedValue =="2015") {
      dset = "times_2015_top30.csv";
      startD3();
    }
    else if (selectedValue =="2014") {
      dset = "times_2014_top30.csv";
      startD3();
    }
    else if (selectedValue =="2013") {
      dset = "times_2013_top30.csv";
      startD3();
    }
    else if (selectedValue =="2012") {
      dset = "times_2012_top30.csv";
      startD3();
    }
    else if (selectedValue =="2011") {
      dset = "times_2011_top30.csv";
      startD3();
    }
    console.log(dset);
};

function startD3(){
  console.log("entering main");
  document.getElementById("pc").innerHTML = "";

var tooltip = d3.select("#pc")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("a simple tooltip")
    .attr("class","tooltip");

var m = [30, 10, 10, 10],
    w = 700 - m[1] - m[3],
    h = 400 - m[0] - m[2];

var x = d3.scale.ordinal().rangePoints([0, w], 1),
    y = {},
    dragging = {};

var line = d3.svg.line(),
    axis = d3.svg.axis().orient("left"),
    background,
    foreground;

var svg = d3.select("#pc").append("svg")
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
  .append("g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

d3.csv(dset, function(error, piers) {

  // Extract the list of dimensions and create a scale for each.
  x.domain(dimensions = d3.keys(piers[0]).filter(function(d) {
    return d!= "name" && d != "world_rank" && d!= "country" && d!= "university_name" &&(y[d] = d3.scale.linear()
        .domain(d3.extent(piers, function(p) { return +p[d]; }))
        .range([h, 0]));
  }));

  // Add grey background lines for context.
  background = svg.append("g")
      .attr("class", "background")
    .selectAll("path")
      .data(piers)
    .enter().append("path")
      .attr("d", path);

  // Add blue foreground lines for focus.
  foreground = svg.append("g")
      .attr("class", "foreground")
    .selectAll("path")
      .data(piers)
    .enter().append("path")
      .attr("d", path)
    .on("mouseover", function(d){
  d3.select(this).transition().duration(100)
      .style({'stroke' : '#F00'});
  tooltip.text(d.world_rank + ". " + d.university_name);
  return tooltip.style("visibility", "visible");
    })
    .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
    .on("mouseout", function(d){
  d3.select(this).transition().duration(100)
  .style({'stroke': 'steelblue' })
  .style({'stroke-width' : '2'});
  return tooltip.style("visibility", "hidden");
    });

  // Add a group element for each dimension.
  var g = svg.selectAll(".dimension")
      .data(dimensions)

    .enter().append("g")
      .attr("class", "dimension")
      .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
      .call(d3.behavior.drag()
        .on("dragstart", function(d) {
          dragging[d] = this.__origin__ = x(d);
          background.attr("visibility", "hidden");
        })
        .on("drag", function(d) {
          dragging[d] = Math.min(w, Math.max(0, this.__origin__ += d3.event.dx));
          foreground.attr("d", path);
          dimensions.sort(function(a, b) { return position(a) - position(b); });
          x.domain(dimensions);
          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
        })
        .on("dragend", function(d) {
          delete this.__origin__;
          delete dragging[d];
          transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
          transition(foreground)
              .attr("d", path);
          background
              .attr("d", path)
              .transition()
              .delay(500)
              .duration(0)
              .attr("visibility", null);
        }));

  // Add an axis and title.
  g.append("g")
      .attr("class", "axis")
      .style("font-size", "12px")
      .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
    .append("text")
      .attr("text-anchor", "middle")
      .attr("y", -9)
      .text(String)
      .style("font-size", "12px")
      .style("font-weight", "bold");

  // Add and store a brush for each axis.
  g.append("g")
      .attr("class", "brush")
      .each(function(d) { d3.select(this).call(y[d].brush = d3.svg.brush().y(y[d]).on("brushstart", brushstart).on("brush", brush)); })
    .selectAll("rect")
      .attr("x", -8)
      .attr("width", 16);
});

function position(d) {
  var v = dragging[d];
  return v == null ? x(d) : v;
}

function transition(g) {
  return g.transition().duration(500);
}

// Returns the path for a given data point.
function path(d) {
  return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
}

// When brushing, don’t trigger axis dragging.
function brushstart() {
  d3.event.sourceEvent.stopPropagation();
}

// Handles a brush event, toggling the display of foreground lines.
function brush() {
  var actives = dimensions.filter(function(p) { return !y[p].brush.empty(); }),
      extents = actives.map(function(p) { return y[p].brush.extent(); });
  foreground.style("display", function(d) {
    return actives.every(function(p, i) {
      return extents[i][0] <= d[p] && d[p] <= extents[i][1];
    }) ? null : "none";
  });
}
}

