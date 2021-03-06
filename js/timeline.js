
/*
 * CorrelationVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data
 * @param _handler				-- the handler for node clicks
 */

Timeline = function(_parentElement, _attrEnum){
	this.parentElement = _parentElement;
	this.attrEnum = _attrEnum;
  this.initVis();
}


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

Timeline.prototype.initVis = function(){
	var vis = this;

	vis.margin = { top: 20, right: 60, bottom: 30, left: 60 };

  vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
  vis.height = 300 - vis.margin.top - vis.margin.bottom;


	// SVG drawing area
	vis.svg = d3.select("#" + vis.parentElement).append("svg")
			.attr("width", vis.width + vis.margin.left + vis.margin.right)
			.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
		.append("g")
			.attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

  // Scales and axes
  vis.x = d3.scaleTime()
      .range([0, vis.width])
      .domain([new Date(2005, 0, 1), new Date(2016, 0, 1)]);

  vis.y = d3.scaleLinear()
      .range([vis.height, 0])
      // set domain later

  vis.xAxis = d3.axisBottom()
      .scale(vis.x);

  vis.yAxis = d3.axisLeft()
			.scale(vis.y);

	vis.svg.append("g")
			.attr("class", "x-axis axis")
			.attr("transform", "translate(0," + vis.height + ")")
	vis.svg.append("g")
      .attr("class", "y-axis axis")
}



/*
 * Data wrangling
 */

Timeline.prototype.wrangleData = function(){
	var vis = this;
	let data = vis.selectedData[vis.selectedAttr];
	let timelineData = []

	// TODO: instead of hardcoding selection, update it so that it gets selection
	// from the side panel
	for(let i = 1; i < data.length-1; i++) {
		let lineData = {
			year1: data[i].year,
			data1: data[i][vis.selectedAttr],
			year2: data[i+1].year,
			data2: data[i+1][vis.selectedAttr],
		}
		timelineData.push(lineData);
	}
  vis.timelineData = timelineData;
	vis.displayData = data;
	// Update the visualization
	vis.updateVis();
}



/*
 * The drawing function - should use the D3 update sequence (enter, update, exit)
 * Function parameters only needed if different kinds of updates are needed
 */

Timeline.prototype.updateVis = function(){
	var vis = this;
  let data = vis.timelineData;

	var extent = d3.extent(vis.displayData, function(d) {
	  return d[vis.selectedAttr];
	});

  vis.y.domain(extent);

	let lines = vis.svg.selectAll(".line").data(data)
	lines.enter()
			.append("line")
			.merge(lines)
			.attr("class", "line")
			.attr("x1", function(d) {  return vis.x(new Date(d.year1, 0, 1)); })
			.attr("y1", function(d) { return vis.y(d.data1); })
			.attr("x2", function(d) { return vis.x(new Date(d.year2, 0, 1)); })
			.attr("y2", function(d) { return vis.y(d.data2); })
			.attr("stroke", "black")
			.attr("stroke-width", 2);

	d3.select(".x-axis").call(vis.xAxis);
	d3.select(".y-axis").call(vis.yAxis);
}

Timeline.prototype.subBoroughSelected = function(subBorough){
	var vis = this;
	if(vis.selectedAttr) {
		vis.selectedData = subBorough;
	  vis.wrangleData();
	} else {
		alert("Please select an attribute");
	}
}

Timeline.prototype.attributeSelected = function(attr){
	var vis = this;
	console.log(attr);
	if(vis.selectedAttr) {
		vis.selectedAttr = this.attrEnum[attr];
		vis.wrangleData();
	} else {
		vis.selectedAttr = this.attrEnum[attr];
	}
}
