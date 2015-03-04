# d3.basketball-shot-chart

This visualization aims to become a generic means of generating charts on a basketball court. Currently it only supports hexbin shot charts, with lots of flexibility, but is alpha quality and will be refactored to support other binning mechanisms and other mark types on top of a basketball court.

Currently customizable:

- Court dimensions/lines
- Binning definition
- Hexagon size range and color range
- Integrating different shot chart datasets
- Titles and labels

## Setup

- Include ```d3.js```
- Include ```hexbin.js``` [d3.hexbin](https://github.com/virajsanghvi/d3-plugins/tree/master/hexbin) - NOTE: this is a fork
- Include ```d3.chart.js``` - [d3.chart](http://misoproject.com/d3-chart/)
- Include ```d3.chart.defaults.js``` [d3.chart.defaults](https://github.com/virajsanghvi/d3.chart.defaults)
- Include ```d3.basketball-shot-chart.js```
- Include ```d3.basketball-shot-chart.css``` (or include the sass file)

## Examples

This library is currently used to generate the shot charts at [tothemean](http://tothemean.com/tools/shot-charts), and there's a [blog post that walks through using this chart](FIXME).

If you clone the repo, you'll also find a simple example in the ```example``` directory.

## To use:

Generally, you likely have some shot chart data that's an array of data points representing shots, including the x, y position on the court, and whether the shot was made: 

```
  var data = [{"x":2,"y":9,"made":1},{"x":2,"y":8,"made":1},...];
```

You can continue with this, or you can also self aggregate to reduce the size/complexity of the data, and capture number of makes and attempts at a location:

```
  var data = [{"x":2,"y":9,"made":3,"attempts":3},{"x":2,"y":8,"made":0,"attempts":4},...];
```

NOTE: Even in this scheme, a point for the same location can be repeated, as all points will be aggregated as part of the binning process (which is how we handle the first simple case).

Once we have our data, we can quickly chart it:

```javascript
  var chart = d3.select(el)
    .append("svg")
    .chart("BasketballShotChart")
      .draw(data); 
```

By default, the shot chart visualization recognizes the data structure above, but that can easily be configured with the options below. Also, by default, the heat chart is based on a range of shooting 0% to 100%. Most shot charts you've probably seen compare to the average, and its up to you to calculate that, but you can use the options below to update the range of values for the heatMap, and to make the hexagon colors or radiuses based on any value from your data you want.

# Options

You can pass any of these options when creating a new chart. You can change them through public setters, but the shot chart won't autoimically pick them up - yet.

These are all defined in the code, and I recommend looking there for more information on how they're actually utilized.

- basketDiameter: basketball hoop diameter (ft) (default: 1.5) 
- basketProtrusionLength: distance from baseline to backboard (ft) (default: 4)
- basketWidth: backboard width (ft) (default: 6)
- colorLegendTitle: title of hexagon color legend (default: 'Efficiency')
- colorLegendStartLabel: label for starting of hexagon color range (default: '< avg')
- colorLegendEndLabel: label for ending of hexagon color range (default: '> avg')
- courtLength: full length of basketball court (ft) (default: 94)  
- courtWidth: full width of basketball court (ft) (default: 50)
- freeThrowLineLength: distance from baseline to free throw line (ft) (default: 19)
- freeThrowCircleRadius: radius of free throw line circle (ft) (default: 6)
- heatScale: d3 scale for hexagon colors (default: d3 quantize scale if [0, 1] domain and colors from Goldsberry's shot charts)
- height: height of svg, specifying won't change scale of chart (default: undefined)
- hexagonBin: method of aggregating points into a bin (e.g. function (point, bin) {...}) (default: bins by aggregating makes and attempts from points) 
- hexagonBinVisibleThreshold: how many points does a bin need to be visualized (default: 1)
- hexagonFillValue: method to determine value to be used with specified heatScale (e.g. function (bin) {...}) (default: returns bin.made/bin.attempts)
- hexagonRadius: bin size with regards to courth width/height (ft) (default: .75)
- hexagonRadiusSizes: discrete hexagon size values that radius value is mapped to, intentionally hides low frequency points (default: [0, .4, .6, .75])
- hexagonRadiusThreshold: how many points in a bin to consider it while building radius scale (default: 2)
- hexagonRadiusValue: method to determine radius value to be used in radius scale (e.g. function (bin) {...}) (default: returns bin.attempts)
- keyMarkWidth: width of key marks (dashes on side of the paint) (ft) (default: .5)
- keyWidth: width the key (paint) (ft) (default: 16)
- restrictedCircleRadius: radius of restricted circle (ft) (default: 4)
- sizeLegendTitle: title of hexagon size legend (default: 'Frequency')
- sizeLegendSmallLabel: label of start of hexagon size legend (default: 'low')
- sizeLegendLargeLabel: label of end of hexagon size legend (default: 'high')
- threePointCutoffLength: distance from baseline where three point line because circular (ft) (default: 14)
- threePointRadius: distance of three point line from basket (ft) (default: 23.75)
- threePointSideRadius: distance of corner three point line from basket (ft) (default: 22)
- title: title of chart (default: 'Shot chart')
- translateX: method to determine x position of a bin on the court (default: x value)
- translateY: method to determine y position of a bin on the court (default: flips y axis to opposite side of court)
- width: width of svg (default: 500)
