/**
 * Create and configure NBA shot charts for offense and defense.
 *
 * Requires:
 *   - d3
 *   - d3.chart
 *   - d3.chart.defaults
 */
(function () {

  var clipCounter = 0;

  var BasketballShotChart = d3.chart('BasketballShotChart', {

    initialize: function () {
      this.calculateVisibleCourtLength();

      var base = this.base
        .attr('class', 'shot-chart');

      // draw base court
      this.drawCourt();

      // add title
      this.drawTitle();

      // draw legend
      this.drawLegend();

      // add data
      this.drawShots();
    },
     
    // helper to create an arc path
    appendArcPath: function (base, radius, startAngle, endAngle) {
      var points = 30;

      var angle = d3.scale.linear()
          .domain([0, points - 1])
          .range([startAngle, endAngle]);

      var line = d3.svg.line.radial()
          .interpolate("basis")
          .tension(0)
          .radius(radius)
          .angle(function(d, i) { return angle(i); });

      return base.append("path").datum(d3.range(points))
          .attr("d", line);
    },

    // draw basketball court
    drawCourt: function () {
      var courtWidth = this._courtWidth,
          visibleCourtLength = this._visibleCourtLength,
          keyWidth = this._keyWidth
          threePointRadius = this._threePointRadius,
          threePointSideRadius = this._threePointSideRadius, 
          threePointCutoffLength = this._threePointCutoffLength,
          freeThrowLineLength = this._freeThrowLineLength,
          freeThrowCircleRadius = this._freeThrowCircleRadius,
          basketProtrusionLength = this._basketProtrusionLength,
          basketDiameter = this._basketDiameter,
          basketWidth = this._basketWidth,
          restrictedCircleRadius = this._restrictedCircleRadius,   
          keyMarkWidth = this._keyMarkWidth;

      var base = this.base
        .attr('width', this._width)
        .attr('viewBox', "0 0 " + courtWidth + " " + visibleCourtLength)
        .append('g')
          .attr('class', 'shot-chart-court');
      if (this._height) base.attr('height', this._height);
                       
      base.append("rect")
        .attr('class', 'shot-chart-court-key')
        .attr("x", (courtWidth / 2 - keyWidth / 2))
        .attr("y", (visibleCourtLength - freeThrowLineLength))
        .attr("width", keyWidth)
        .attr("height", freeThrowLineLength);

      base.append("line")
        .attr('class', 'shot-chart-court-baseline')
        .attr("x1", 0)
        .attr("y1", visibleCourtLength)
        .attr("x2", courtWidth)
        .attr("y2", visibleCourtLength);
              
      var tpAngle = Math.atan(threePointSideRadius / 
        (threePointCutoffLength - basketProtrusionLength - basketDiameter/2));
      this.appendArcPath(base, threePointRadius, -1 * tpAngle, tpAngle)
        .attr('class', 'shot-chart-court-3pt-line')
        .attr("transform", "translate(" + (courtWidth / 2) + ", " + 
          (visibleCourtLength - basketProtrusionLength - basketDiameter / 2) + 
          ")");
         
      [1, -1].forEach(function (n) {
        base.append("line")
          .attr('class', 'shot-chart-court-3pt-line')
          .attr("x1", courtWidth / 2 + threePointSideRadius * n)
          .attr("y1", visibleCourtLength - threePointCutoffLength)
          .attr("x2", courtWidth / 2 + threePointSideRadius * n)
          .attr("y2", visibleCourtLength);
      });
        
      this.appendArcPath(base, restrictedCircleRadius, -1 * Math.PI/2, Math.PI/2)
        .attr('class', 'shot-chart-court-restricted-area')
        .attr("transform", "translate(" + (courtWidth / 2) + ", " + 
          (visibleCourtLength - basketProtrusionLength - basketDiameter / 2) + ")");
                                                         
      this.appendArcPath(base, freeThrowCircleRadius, -1 * Math.PI/2, Math.PI/2)
        .attr('class', 'shot-chart-court-ft-circle-top')
        .attr("transform", "translate(" + (courtWidth / 2) + ", " + 
          (visibleCourtLength - freeThrowLineLength) + ")");
                                                          
      this.appendArcPath(base, freeThrowCircleRadius, Math.PI/2, 1.5 * Math.PI)
        .attr('class', 'shot-chart-court-ft-circle-bottom')
        .attr("transform", "translate(" + (courtWidth / 2) + ", " + 
          (visibleCourtLength - freeThrowLineLength) + ")");

      [7, 8, 11, 14].forEach(function (mark) {
        [1, -1].forEach(function (n) {
          base.append("line")
            .attr('class', 'shot-chart-court-key-mark')
            .attr("x1", courtWidth / 2 + keyWidth / 2 * n + keyMarkWidth * n)
            .attr("y1", visibleCourtLength - mark)
            .attr("x2", courtWidth / 2 + keyWidth / 2 * n)
            .attr("y2", visibleCourtLength - mark)
        });
      });    

      base.append("line")
        .attr('class', 'shot-chart-court-backboard')
        .attr("x1", courtWidth / 2 - basketWidth / 2)
        .attr("y1", visibleCourtLength - basketProtrusionLength)
        .attr("x2", courtWidth / 2 + basketWidth / 2)
        .attr("y2", visibleCourtLength - basketProtrusionLength)
                                     
      base.append("circle")
        .attr('class', 'shot-chart-court-hoop')
        .attr("cx", courtWidth / 2)
        .attr("cy", visibleCourtLength - basketProtrusionLength - basketDiameter / 2)
        .attr("r", basketDiameter / 2)
    },

    // add title to svg
    drawTitle: function () {
      this.base.append("text")
        .classed('shot-chart-title', true)
        .attr("x", (this._courtWidth / 2))             
        .attr("y", (this._courtLength / 2 - this._visibleCourtLength) / 3)
        .attr("text-anchor", "middle")  
        .text(this._title);
    },

    // add legends to svg
    drawLegend: function () {
      var courtWidth = this._courtWidth,
          visibleCourtLength = this._visibleCourtLength,
          heatScale = this._heatScale,
          hexagonRadiusSizes = this._hexagonRadiusSizes,
          hexagonFillValue = this._hexagonFillValue,
          keyWidth = this._keyWidth,
          basketProtrusionLength = this._basketProtrusionLength;

      var heatRange = heatScale.range();
      var largestHexagonRadius = hexagonRadiusSizes[hexagonRadiusSizes.length - 1];
      var colorXMid = courtWidth - 
        (threePointSideRadius - keyWidth / 2) / 2 - 
        (courtWidth / 2 - threePointSideRadius);
      var colorXStart = colorXMid - (heatRange.length * largestHexagonRadius); 
      var colorYStart = visibleCourtLength - basketProtrusionLength/3;
      var hexbin = d3.hexbin();
      var hexagon = hexbin.hexagon(largestHexagonRadius);
      var colorLegend = this.base.append('g')
        .classed('legend', true);
      colorLegend.append("text")
        .classed('legend-title', true)
        .attr("x", colorXMid)             
        .attr("y", colorYStart - largestHexagonRadius * 2)
        .attr("text-anchor", "middle")  
        .text(this._colorLegendTitle);
      colorLegend.append("text")
        .attr("x", colorXStart)             
        .attr("y", colorYStart)
        .attr("text-anchor", "end")  
        .text(this._colorLegendStartLabel); 
      colorLegend.append("text")
        .attr("x", colorXStart + heatRange.length * 2 * largestHexagonRadius)             
        .attr("y", colorYStart)
        .attr("text-anchor", "start")  
        .text(this._colorLegendEndLabel);  
      colorLegend.selectAll('path').data(heatRange)
        .enter()
          .append('path')
            .attr('d', hexagon)
            .attr("transform", function (d, i) {
              return "translate(" + 
                (colorXStart + ((1 + i*2) *largestHexagonRadius)) + ", " + 
                (colorYStart) + ")";
            })
            .style('fill', function (d, i) { return d; });

      
      var sizeRange = hexagonRadiusSizes.slice(-3);
      var sizeLengendWidth = 0;
      for (var i = 0, l = sizeRange.length; i < l; ++i) {
        sizeLengendWidth += sizeRange[i] * 2;
      }
      var sizeXMid = (threePointSideRadius - keyWidth / 2) / 2 + 
        (courtWidth / 2 - threePointSideRadius);
      var sizeXStart = sizeXMid - (sizeLengendWidth / 2);
      var sizeYStart = visibleCourtLength - basketProtrusionLength/3;
      var sizeLegend = this.base.append('g')
        .classed('legend', true);
      sizeLegend.append("text")
        .classed('legend-title', true)
        .attr("x", sizeXMid)             
        .attr("y", sizeYStart - largestHexagonRadius * 2)
        .attr("text-anchor", "middle")  
        .text(this._sizeLegendTitle);
      sizeLegend.append("text")
        .attr("x", sizeXStart)             
        .attr("y", sizeYStart)
        .attr("text-anchor", "end")  
        .text(this._sizeLegendSmallLabel);
      sizeLegend.selectAll('path').data(sizeRange)
        .enter()
          .append('path')
            .attr('d', function (d) { return hexbin.hexagon(d); })
            .attr("transform", function (d, i) {
              sizeXStart += d * 2;
              return "translate(" + 
                (sizeXStart - d) + ", " + 
                sizeYStart + ")";
            })
            .style('fill', '#999');
      sizeLegend.append("text")
        .attr("x", sizeXStart)
        .attr("y", sizeYStart)
        .attr("text-anchor", "start")  
        .text(this._sizeLegendLargeLabel); 
    },

    // draw hexagons on court
    drawShots: function () {
      var courtWidth = this._courtWidth,
          visibleCourtLength = this._visibleCourtLength,
          hexagonRadius = this._hexagonRadius,
          heatScale = this._heatScale,
          hexagonBinVisibleThreshold = this._hexagonBinVisibleThreshold,
          hexagonRadiusThreshold = this._hexagonRadiusThreshold,
          hexagonRadiusSizes = this._hexagonRadiusSizes,
          hexagonRadiusValue = this._hexagonRadiusValue,
          hexagonFillValue = this._hexagonFillValue,
          radiusScale;

      // bin all shots into hexagons 
      var hexbin = d3.hexbin()
        .size([courtWidth, visibleCourtLength])
        .radius(hexagonRadius)
        .x(this._translateX.bind(this))
        .y(this._translateY.bind(this))
        .bin(this._hexagonBin);

      // create layerBase
      var layerBase = this.base.append('g');
           
      // append clip to prevent showing data outside range
      clipCounter += 1;
      var clipId = 'bbs-clip-' + clipCounter; 
      layerBase.append('clipPath')
        .attr('id', clipId)
        .append("rect")
          .attr("class", "shot-chart-mesh")
          .attr("width", courtWidth)
          .attr("height", visibleCourtLength);
           
      // add layer
      this.layer('hexagons', layerBase, {

        dataBind: function (data) {
          // subset bins to ones that meet threshold parameters
          var allHexbinPoints = hexbin(data);
          var hexbinPoints = [];
          var hexbinQuantities = [];
          for (var i = 0, l = allHexbinPoints.length; i < l; ++i) {
            var pts = allHexbinPoints[i];
            var numPts = 0;
            for (var j = 0, jl = pts.length; j < jl; ++j) {
              numPts += pts[j].attempts || 1;
            }
            if (numPts > hexagonBinVisibleThreshold) hexbinPoints.push(pts);
            if (numPts > hexagonRadiusThreshold) hexbinQuantities.push(numPts);
          }

          // create radius scale
          radiusScale = d3.scale.quantile()
            .domain(hexbinQuantities)
            .range(hexagonRadiusSizes)

          return this.append('g')
            .attr('clip-path', 'url(#' + clipId + ')')
            .selectAll('.hexagon')
              .data(hexbinPoints);
        },

        insert: function () {
          return this.append('path')
            .classed('shot-chart-hexagon', true);
        },

        events: {

          enter: function () {
            this.attr('transform', function(d) { 
              return "translate(" + d.x + "," + d.y + ")"; 
            });
          },

          merge: function () {
            this
              .attr('d', function(d) { 
                var val = radiusScale(hexagonRadiusValue(d))
                if (val > 0) return hexbin.hexagon(val); 
              })
              .style('fill', function(d) { 
                return heatScale(hexagonFillValue(d)); 
              });
          },

          exit: function () {
            this.remove();
          }

        },

      });
           
    },

    // redraw chart
    redraw: function () {
      if (this.data) this.draw(this.data);
    },

    // on court length change, recalculate length of visible court
    calculateVisibleCourtLength: function () {
      var halfCourtLength = this._courtLength / 2;
      var threePointLength = this._threePointRadius + 
        this._basketProtrusionLength;
      this._visibleCourtLength = threePointLength + 
        (halfCourtLength - threePointLength) / 2;
    },
 
  });

  d3.chart.initializeDefaults(BasketballShotChart, {
    // basketball hoop diameter (ft)
    basketDiameter: 1.5,
    // distance from baseline to backboard (ft)
    basketProtrusionLength: 4,
    // backboard width (ft)
    basketWidth: 6,
    // title of hexagon color legend
    colorLegendTitle: 'Efficiency',
    // label for starting of hexagon color range
    colorLegendStartLabel: '< avg',
    // label for ending of hexagon color range
    colorLegendEndLabel: '> avg',
    // full length of basketball court (ft)
    courtLength: 94,
    // full width of basketball court (ft)
    courtWidth: 50,
    // distance from baseline to free throw line (ft)
    freeThrowLineLength: 19,
    // radius of free throw line circle (ft)
    freeThrowCircleRadius: 6,
    // d3 scale for hexagon colors
    heatScale: d3.scale.quantize()
      .domain([0, 1])
      .range(['#5458A2', '#6689BB', '#FADC97', '#F08460', '#B02B48']),
    // height of svg
    height: undefined,
    // method of aggregating points into a bin
    hexagonBin: function (point, bin) {
      var attempts = point.attempts || 1;
      var made = +point.made || 0;
      bin.attempts = (bin.attempts || 0) + attempts;
      bin.made = (bin.made || 0) + made;
    },
    // how many points does a bin need to be visualized
    hexagonBinVisibleThreshold: 1,
    // method to determine value to be used with specified heatScale
    hexagonFillValue: function(d) {  return d.made/d.attempts; },
    // bin size with regards to courth width/height (ft)
    hexagonRadius: .75,
    // discrete hexagon size values that radius value is mapped to
    hexagonRadiusSizes: [0, .4, .6, .75],
    // how many points in a bin to consider it while building radius scale
    hexagonRadiusThreshold: 2,
    // method to determine radius value to be used in radius scale
    hexagonRadiusValue: function (d) { return d.attempts; },
    // width of key marks (dashes on side of the paint) (ft)
    keyMarkWidth: .5,
    // width the key (paint) (ft)
    keyWidth: 16,
    // radius of restricted circle (ft)
    restrictedCircleRadius: 4,
    // title of hexagon size legend
    sizeLegendTitle: 'Frequency',
    // label of start of hexagon size legend
    sizeLegendSmallLabel: 'low',
    // label of end of hexagon size legend
    sizeLegendLargeLabel: 'high',
    // distance from baseline where three point line because circular (ft)
    threePointCutoffLength: 14,
    // distance of three point line from basket (ft)
    threePointRadius: 23.75,
    // distance of corner three point line from basket (ft)
    threePointSideRadius: 22, 
    // title of chart
    title: 'Shot chart',
    // method to determine x position of a bin on the court
    translateX: function (d) { return d.x; },
    // method to determine y position of a bin on the court
    translateY: function (d) { return this._visibleCourtLength - d.y; },
    // width of svg
    width: 500,
  });

})()
