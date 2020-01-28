import {
  select,
  csv,
  map,
  scaleOrdinal,
  schemePaired,
  geoPath,
  scaleSqrt,
  geoMercator,
  json,
  extent
} from "d3";
import "./styles.css";

const svg = select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");

const projection = geoMercator()
  .center([0, 20])                // GPS of location to zoom on
  .scale(99)                       // This is like the zoom
  .translate([width / 2, height / 2]);


Promise.all([
  json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
  csv("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/data_gpsLocSurfer.csv")
])
  .then(function (data) {
    render(data[0], data[1])
  });

function render(dataGeo, data) {

  var allContinent = map(data, function (d) {
    return (d.homecontinent)
  }).keys()

  var color = scaleOrdinal()
    .domain(allContinent)
    .range(schemePaired);

  var valueExtent = extent(data, function (d) {
    return +d.n;
  });

  var size = scaleSqrt()
    .domain(valueExtent)  // What's in the data
    .range([1, 50])

  svg.append("g")
    .selectAll("path")
    .data(dataGeo.features)
    .enter()
    .append("path")
    .attr("fill", "#b8b8b8")
    .attr("d", geoPath()
      .projection(projection)
    )
    .style("stroke", "none")
    .style("opacity", .3)

  svg
    .selectAll("myCircles")
    .data(data.sort(function (a, b) {
      return +b.n - +a.n
    }).filter(function (d, i) {
      return i < 1000
    }))
    .enter()
    .append("circle")
    .attr("cx", function (d) {
      return projection([+d.homelon, +d.homelat])[0]
    })
    .attr("cy", function (d) {
      return projection([+d.homelon, +d.homelat])[1]
    })
    .attr("r", function (d) {
      return size(+d.n)
    })
    .style("fill", function (d) {
      return color(d.homecontinent)
    })
    .attr("stroke", function (d) {
      if (d.n > 2000) {
        return "black"
      } else {
        return "none"
      }
    })
    .attr("stroke-width", 1)
    .attr("fill-opacity", .4)

  // Add title and explanation
  svg
    .append("text")
    .attr("text-anchor", "end")
    .style("fill", "black")
    .attr("x", width - 10)
    .attr("y", height - 30)
    .attr("width", 90)
    .html("WHERE SURFERS LIVE")
    .style("font-size", 14)


  // --------------- //
  // ADD LEGEND //
  // --------------- //

  // Add legend: circles
  var valuesToShow = [100, 4000, 15000]
  var xCircle = 40
  var xLabel = 90
  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("circle")
    .attr("cx", xCircle)
    .attr("cy", function (d) {
      return height - size(d)
    })
    .attr("r", function (d) {
      return size(d)
    })
    .style("fill", "none")
    .attr("stroke", "black")

  // Add legend: segments
  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("line")
    .attr('x1', function (d) {
      return xCircle + size(d)
    })
    .attr('x2', xLabel)
    .attr('y1', function (d) {
      return height - size(d)
    })
    .attr('y2', function (d) {
      return height - size(d)
    })
    .attr('stroke', 'black')
    .style('stroke-dasharray', ('2,2'))

  // Add legend: labels
  svg
    .selectAll("legend")
    .data(valuesToShow)
    .enter()
    .append("text")
    .attr('x', xLabel)
    .attr('y', function (d) {
      return height - size(d)
    })
    .text(function (d) {
      return d
    })
    .style("font-size", 10)
    .attr('alignment-baseline', 'middle')
};


