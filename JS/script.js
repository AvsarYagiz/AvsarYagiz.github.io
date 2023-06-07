// Define the path to the JSON data file
let path = "edu.json";

// Declare variables
let data;
let chartDiv = document.getElementById("chart");
let svg = d3.select(chartDiv).append("svg");
let max_value = 1030;
let color = d3.scaleSequential(d3.interpolateRdBu).domain([max_value, 0]);

// Create the legend SVG
let legendWidth = 500;
let legendHeight = 50;
let legendMargin = 30;
let legendSvg = d3.select("body")
  .append("svg")
  .attr("id", "legend")
  .attr("width", legendWidth)
  .attr("height", legendHeight)
  .style("position", "absolute")
  .style("top", "5px")
  .style("left", "20px");

// Create a linear gradient for the legend
legendSvg.append("defs")
  .append("linearGradient")
  .attr("id", "legendGradient")
  .attr("gradientUnits", "userSpaceOnUse")
  .attr("x1", 0)
  .attr("y1", 0)
  .attr("x2", legendWidth)
  .attr("y2", 0)
  .selectAll("stop")
  .data(d3.range(0, 1.01, 0.01))
  .enter()
  .append("stop")
  .attr("offset", function (d) { return d * 100 + "%"; })
  .attr("stop-color", function (d) { return color(d * max_value); });

// Draw the legend rectangle
legendSvg.append("rect")
  .attr("width", legendWidth)
  .attr("height", legendHeight - legendMargin)
  .style("fill", "url(#legendGradient)");

// Define the legend scale and axis
let legendScale = d3.scaleLinear()
  .domain([0, 1030])
  .range([0, legendWidth]);
let legendAxis = d3.axisBottom(legendScale)
  .ticks(10)
  .tickSize(5)
  .tickPadding(5);

// Add the legend axis to the legend SVG
let legendGroup = legendSvg.append("g")
  .attr("transform", "translate(2," + (legendHeight - legendMargin) + ")")
  .call(legendAxis);

// Style the legend tick labels
legendGroup.selectAll(".tick text")
  .attr("fill", "white")
  .attr("font-size", "10px")
  .attr("dy", "1em");

// Define a number formatter
let format = d3.format("d");

// Create a tooltip element
let tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

// Function to redraw the tree map
function redraw() {
  let width = chartDiv.clientWidth;
  let height = chartDiv.clientHeight;

  // Remove any existing content in the SVG element
  d3.select("svg").html("");

  // Define the chart function
  let chart = () => {
    const root = treemap(filteredData);

    // Create a new SVG element with the updated dimensions
    const svg = d3.select("svg");
    svg.attr("width", width)
      .attr("height", height)
      .classed("svg-content-responsive", true);

    // Create a group for each leaf node in the tree map
    const leaf = svg.selectAll("g")
      .data(root.leaves())
      .enter()
      .append("g")
      .attr("data-id", function (d) {
        return d.data.domicile;
      })
      .attr("transform", d => `translate(${d.x0},${d.y0})`)
      .on("mouseover", function (d) {
        // Highlight the rectangle and text when hovering over a leaf node
        d3.selectAll(`[data-id="${d.data.domicile}"]`).selectAll("rect").attr("stroke", "yellow").attr("stroke-width", "1px");
        d3.selectAll(`[data-id="${d.data.domicile}-text"]`).selectAll("text").attr("stroke", "yellow").attr("stroke-width", "1px");

        // Show the tooltip and populate its content
        tooltip.transition()
          .duration(200)
          .style("opacity", .98);
        tooltip.html(`<div class="tooltip-body" data-id=${d.data.name} >
          <ul>
            <li>Domicile: ${d.data.domicile}</li>
            <li>RegHE: ${d.data.regHE}</li>
            <li>Level of Study: ${d.data.lOS}</li>
            <li>Mode of Study: ${d.data.mOS}</li>
            <li>Student: ${d.data.student}</li>
          </ul>
        </div>`)
          .style("left", (d3.event.pageX + 10) + "px")
          .style("top", (d3.event.pageY + 10) + "px");
      })
      .on("mouseout", function (d) {
        // Remove the highlighting and hide the tooltip when leaving a leaf node
        d3.selectAll(`[data-id="${d.data.domicile}"]`).selectAll("rect").attr("stroke", null);
        d3.selectAll(`[data-id="${d.data.domicile}-text"]`).selectAll("text").attr("stroke", null);

        tooltip.transition()
          .duration(100)
          .style("opacity", 0);
      });

    // Draw rectangles for each leaf node
    leaf.append("rect")
      .attr("fill", function (d) { return color(d.data.student); })
      .attr("fill-opacity", 1.0)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .attr("class", (d) => "node level-" + d.depth);

    // Add text labels to the rectangles
    let txt = leaf.append("text")
      .attr("fill", "black")
      .attr("text-anchor", "middle")
      .attr("y", function () {
        const parentData = d3.select(this.parentNode).datum();
        return (parentData.y1 - parentData.y0) / 2;
      })
      .attr("font-size", d => Math.min(d.x1 - d.x0, d.y1 - d.y0) / 8);

    // Add the "RegHE" text
    txt.append("tspan")
      .text(d => d.data.regHE)
      .attr("class", "regHE")
      .attr("dy", "-1.5em")
      .attr("x", function () {
        const parentData = d3.select(this.parentNode).datum();
        return (parentData.x1 - parentData.x0) / 2;
      });

    // Add the "Level of Study" text
    txt.append("tspan")
      .text(d => d.data.lOS)
      .attr("class", "lOS")
      .attr("dy", "1.4em")
      .attr("x", function () {
        const parentData = d3.select(this.parentNode).datum();
        return (parentData.x1 - parentData.x0) / 2;
      })
      .attr("font-size", d => Math.min(d.x1 - d.x0, d.y1 - d.y0) / 12);

    // Add the "Mode of Study" text
    txt.append("tspan")
      .text(d => d.data.mOS)
      .attr("class", "mOS")
      .attr("dy", "1.4em")
      .attr("x", function () {
        const parentData = d3.select(this.parentNode).datum();
        return (parentData.x1 - parentData.x0) / 2;
      })
      .attr("font-size", d => Math.min(d.x1 - d.x0, d.y1 - d.y0) / 12);

    // Add the "Student" text
    txt.append("tspan")
      .text(d => `${format(d.data.student)}`)
      .attr("class", "student")
      .attr("dy", "1.4em")
      .attr("x", function () {
        const parentData = d3.select(this.parentNode).datum();
        return (parentData.x1 - parentData.x0) / 2;
      });

      svg
      .selectAll("titles")
      .data(
        root.descendants().filter(function (d) {
          return d.depth == 1;
        })
      )
      .enter()
      .append('g')
      .attr("data-id", function (d) {
        return `${d.data.name}-text`;
      })
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("dx", (d) => d.x0 + d.x1)
      .attr("dy", (d) => d.y0 + d.y1)
      .attr("fill-opacity", 1.0)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0)
      .append("text")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0+7) // Padding değeri burada 50 olarak ayarlandı
      .text((d) => d.data.name)
      .attr("font-size", "10px")
      .attr("font-weight", "400")
      .attr("fill", "white");
    

    return svg.node();
  };

  // Filter and sort the data
  let filteredData = d3
    .hierarchy(data)
    .sum(d => d.student)
    .sort((a, b) => b.height - a.height || b.student - a.student);

  // Create the treemap layout
  let treemap = d3
    .treemap()
    .size([width, height])
    .padding(0.5)
    .paddingTop(3)
    .round(false);

  // Call the chart function to draw the tree map
  chart();
}

// Redraw the tree map on window resize
window.addEventListener("resize", redraw);

// Initialize panzoom for zooming and panning functionality
let instance = panzoom(document.getElementById("chart"), {
  zoomSpeed: 0.15,
  maxZoom: 50,
  minZoom: 1
});

// Load the data from the JSON file and redraw the tree map
d3.json(path)
  .then((element) => {
    data = element;
    redraw();
  })
  .catch((error) => {
    console.error(error);
  });
