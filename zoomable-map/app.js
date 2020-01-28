import * as d3 from "d3";
import * as topojson from 'topojson';

import "./styles.css";
import { scaleOrdinal } from "d3";

let initX;
const width = window.innerWidth;
const height = window.innerHeight;
let mouseClicked = false;
let s = 1;
let mouse;

var interpolators = [
  // These are from d3-scale.
  "Viridis",
  "Inferno",
  "Magma",
  "Plasma",
  "Warm",
  "Cool",
  "Rainbow",
  "CubehelixDefault",
  // These are from d3-scale-chromatic
  "Blues",
  "Greens",
  "Greys",
  "Oranges",
  "Purples",
  "Reds",
  "BuGn",
  "BuPu",
  "GnBu",
  "OrRd",
  "PuBuGn",
  "PuBu",
  "PuRd",
  "RdPu",
  "YlGnBu",
  "YlGn",
  "YlOrBr",
  "YlOrRd"
];

const projection = d3.geoMercator()
  .translate([width / 2, height / 2])
  .scale((width - 1) / 2 / Math.PI)

const path = d3.geoPath().projection(projection);

const zoom = d3.zoom()
  .scaleExtent([1, 10])
  .on('zoom', zoomed)
  .on("end", zoomended);

const svg = d3.select('body')
  .append('svg')
  .attr('class', 'container')
  .attr('width', width)
  .attr('height', height)
  .on("wheel", function () {
    initX = d3.mouse(this)[0];
  })
  .on("mousedown", function () {
    //only if scale === 1
    if (s !== 1) return;
    initX = d3.mouse(this)[0];
    mouseClicked = true;
  });

const g = svg.append('g');

svg.call(zoom);
let world;
let dataArray = [];
let qeue = [];

Promise.all([
  d3.json("https://gist.githubusercontent.com/maggiben/9398333/raw/defdcf5519af212c228befa7ff52c44c432495a2/world.json"),
  d3.json("https://gist.githubusercontent.com/jalalazimi/39e6675f798ff7c2316bc4dcf02b6936/raw/3a2efa43d9543012700a9aa3aae1f30642947c4f/stories.json")
])
  .then(function (data) {
    world = data[0];
    dataArray = data[1].stories;
    render(data[0], dataArray)
  });

Promise.all([
  d3.json("https://gist.githubusercontent.com/jalalazimi/d8fb871a32253ecad17b7fa26d0cd070/raw/34d18c65066b0901ba056adb14c14a0feb1728c2/stories-2.json")
])
  .then(function (data) {
    qeue = data[0].stories
  });

setInterval(() => {
  const node = qeue[0];

}, 500000)

function render(world, data) {

  var countries = topojson.feature(world, world.objects.countries).features;

  var country = g.selectAll(".country").data(countries);
  country.enter().insert("path")
    .attr("class", "country")
    .attr("d", path)
    .attr("id", function (d, i) {
      return d.id;
    })
    .attr("title", function (d, i) {
      return d.properties.name;
    })
    .style("fill", function (d, i) {
      return "#2c323a";
      return d.properties.color;
    });

  // data
  var allContinent = d3.map(data, function (d) {
    return (d.stories[0].title)
  }).keys()

  var color = d3.scaleOrdinal()
    .domain(allContinent)
    .range(d3.schemeTableau10);

  var valueExtent = d3.extent(data, function (d) {
    return +d.stories.length;
  });

  var size = d3.scaleSqrt()
    .domain(valueExtent)  // What's in the data
    .range([5, 25])

  g.selectAll("myCircles")
    .data(data.sort(function (a, b) {
      return +b.stories.length - +a.stories.length
    }).filter(function (d, i) {
      return i < 1000
    }))
    .enter()
    .each(function () {
      const group = d3.select(this).append("g")
        .on("mouseover", function (d, i) {
          d3.select(this)
            .select("circle:nth-child(2)")
            .transition()
            .duration(100)
            .attr("r", function (d) {
              return size(+d.stories.length) * 2
            })
        })
        .on("mouseout", function (d, i) {

          d3.select(this)
            .select("circle:nth-child(2)")
            .transition()
            .duration(100)
            .attr("r", 4)

        });

      group.append("circle")
        .attr("cx", function (d) {
          return projection([+d.geo.lng, +d.geo.lat])[0]
        })
        .attr("cy", function (d) {
          return projection([+d.geo.lng, +d.geo.lat])[1]
        })
        .attr("r", 4)
        .style("fill", function (d) {
          return color(+d.stories.length)
        })
        .attr("stroke-width", 1)
        .attr("fill-opacity", .4)
        .transition()
        .duration(1000)
        .attr("r", function (d) {
          return size(+d.stories.length)
        })

      group.append("circle")
        .attr("cx", function (d) {
          return projection([+d.geo.lng, +d.geo.lat])[0]
        })
        .attr("cy", function (d) {
          return projection([+d.geo.lng, +d.geo.lat])[1]
        })
        .attr("r", 3)
        .style("fill", function (d) {
          return color(+d.stories.length)
        })

    })
}


function zoomed() {
  var h = 0;
  const t = [d3.event.transform.x, d3.event.transform.y];
  s = d3.event.transform.k;

  t[0] = Math.min(
    (width / height) * (s - 1),
    Math.max(width * (1 - s), t[0])
  );
  t[1] = Math.min(h * (s - 1) + h * s,
    Math.max(height * (1 - s) - h * s, t[1])
  );
  g.attr("transform", "translate(" + t + ")scale(" + s + ")");
  mouse = d3.mouse(this);

}


function zoomended() {
  if (s !== 1) return;
  mouseClicked = false;
}

