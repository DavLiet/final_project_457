Map = function (_subBoroughHandler, _attrEnum) {
  this.subBoroughHandler = _subBoroughHandler;
  this.attrEnum = _attrEnum;
  this.subBorough1Selected = false;
  this.initVis();
}


Map.prototype.initVis = function () {

  var vis = this;
  vis.svg = d3.select("#subborough").append("svg").attr("width", window.innerWidth / 3).attr("height", window.innerHeight / 1);

  vis.currentYear = 2005; // 2005 is the default year

  d3.queue()
    .defer(d3.json, "data/data.json")
    .defer(d3.json, "data/nyc_sub_borough_area.geojson")
    .awaitAll(function (error, results) {
      // gentrificationData is a dictionary where the key represents the
      // subborough name and the value is the actual data (ex. income, demographics, etc.)
      vis.gentrificationData = results[0]
      vis.geojson = results[1]

      var path = d3.geoPath().projection(d3.geoConicConformal()
        .parallels([33, 45])
        .rotate([96, -39])
        .fitSize([window.innerWidth / 3, window.innerHeight], vis.geojson));

      vis.svg.selectAll("path")
        .data(vis.geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#0fb9b1")
        .attr("stroke", "#fed330")
        .on("mouseover", function (d) {
          d3.select(this).attr("fill", "#fed330")
          var subboroughData = vis.gentrificationData[d.properties.subborough]
          d3.select("#title").text(d.properties.subborough)
        }).on("mouseout", function () {
          d3.select(this).attr("fill", "#0fb9b1")
        }).on("click", function (d) {
          var subboroughData = vis.gentrificationData[d.properties.subborough]
          let subBoroughNum;
          d3.select(this).attr("fill", "#fed330")
          if(!vis.subBorough1Selected) {
            subBoroughNum = 1;
            vis.subBorough1Selected = true;
          } else {
            subBoroughNum = 2;
            vis.subBorough1Selected = false;
          }
          console.log(d.properties.subborough + " subBoroughNum " + subBoroughNum);
          $(vis.subBoroughHandler).trigger("subBoroughSelected",
            {num: subBoroughNum, data: subboroughData, name: d.properties.subborough});
        });
    });
}


// updates current year and calls updateVis to generate currentYear data
// Note: Whenever this function is called, we should also somehow call updateVis to update the map - DLT
Map.prototype.updateCurrentYear = function (newYear) {
  var vis = this;
  vis.currentYear = newYear
}


Map.prototype.updateVis = function (selectedAttributes) {
  var vis = this;

  var blueScale = d3.scaleOrdinal(d3.schemeBlues[9]);
  console.log(vis.gentrificationData);

  vis.map.selectAll("path")
    .data(vis.geojson.features)
    .attr("fill", function (d) {
      var average = 0;
      var numAttributes = selectedAttributes.length;

      // TODO: CHANGE HOW WE CALCULATE THE SCORE
      // CALCULATING SCORE HERE
      selectedAttributes.forEach(function (attr) {
        let data = vis.gentrificationData[d.properties.subborough][vis.attrEnum[attr]].normalized
        let currAttr = vis.attrEnum[attr]
        let sum = 0
        data.forEach(function (val) {
          sum += val[currAttr]
        })
        average += (sum / data.length)
      })
      return blueScale(average);
    })
    .attr("stroke", function (d) {
      return ("black");
    })
    .on("mouseover", function (d) {
      vis.lastColor = d3.select(this).attr("fill");
      // Hovering over subborough will display name and console.log the data of subborough
      d3.select(this).attr("fill", "#fed330")
      var subboroughData = vis.gentrificationData[d.properties.subborough]
      d3.select("#title").text(d.properties.subborough)
    }).on("mouseout", function (d) {
      //reset the color back to how it was before
      d3.select(this).attr("fill", vis.lastColor);
    });
}
