'use strict';

function chart(props) {

	props.header = props.header || false;
	props.width = props.width || 800;
	props.height = props.height || 400;
	props.col_width = props.col_width || 105;
	props.tag_slice = props.tag_slice || 18;

	var values = props.data,
		points = [],
		margin = { top: 25, right: 50, bottom: 25, left: 50 },
		width = props.width - margin.left - margin.right,
		height = props.height - margin.top - margin.bottom,
		tick_width = 10,
		places = 3,
		col_width = props.col_width,
		tick_label = " mm"
	;

	console.log("num values = " + values.length);

	// data modification & point collection
	values.forEach(function(d) {
		d.diff = Math.abs(d.max - d.min);
		d.mean = d3.mean([d.min, d.max]);
		points.push(d.max);
		points.push(d.min);
	});

	// calc min/max scale
	var max = d3.max(values, function(d) { return d.max; });
	var min = d3.min(values, function(d) { return d.min; });

	var mid = d3.mean(points);
	var len = values.length;

	var cwidth = function(i) {
		return col_width*i;
	};
	var cmid = col_width/2;
	var start_y = 0;

	var y = d3.scale.linear()
		.domain([Math.ceil(max +.5), Math.floor(min -.5)])    // asc
		.range([start_y, height])
	;

	console.log("y min = " + min);
	console.log("y max = " + max);
	console.log("y mid = " + mid);
	console.log("x len = " + len);

	// SVG
	var svg = d3.select("#chart")
		.append("svg")
			.attr("width", props.width)
			.attr("height", props.height)
	;
	var g = svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
	;

	// mid line & label
	g.append('line')
			.attr('class', 'mid')
			.attr('x1', 0)
			.attr('y1',y(mid))
			.attr('x2', cwidth(len))
			.attr('y2', y(mid))
	;
	g.append('text')
			.attr('class', 'mid')
			.attr('x', function(d,i) {
				return cwidth(len) + tick_width/2;
			})
			.attr('y', y(mid))
			.attr('dy', '.3em')
			.text(d3.round(mid, places) + tick_label)
	;


	// columns
	var columns = g.selectAll('g')
			.data(values)
			.enter()
			.append('g')
			.attr('transform', function(d,i) {
				return 'translate(' + cwidth(i) + ',0)';
			})
	;

	// name
	columns.append('text')
		.attr('class', 'tag')
		.text(function(d) {
			return d.name;
		})
		.attr('x', cmid)
		.attr('y', function(d) {
			return height + margin.bottom / 2;
		})
		.attr('dy', '.7em')
	;

	// line  - upper half
	columns.append('line')
		.attr('class', 'chart')
		.attr('x1', function(d,i) {
			return cmid;
		})
		.attr('y1', function(d,i) {
			return y(d.max);
		})
		.attr('x2', function(d,i) {
			return cmid;
		})
		.attr('y2', function(d,i) {
			return y(d3.mean([d.min, d.max])) - 10;
		})
		//.style('stroke', 'grey')
		//.style('stroke-width', '3')
	;
	// line - lower half
	columns.append('line')
		.attr('class', 'chart')
		.attr('x1', function(d,i) {
			return cmid;
		})
		.attr('y1', function(d,i) {
			return y(d3.mean([d.min, d.max])) + 10;
		})
		.attr('x2', function(d,i) {
			return cmid;
		})
		.attr('y2', function(d,i) {
			return y(d.min);
		})
		//.style('stroke', 'grey')
		//.style('stroke-width', '3')
	;

	// upper bound
	columns.append('circle')
		.attr('class', 'chart')
		.attr('cx', function(d,i) {
			return cmid;
		})
		.attr('cy', function(d,i) {
			return y(d.max);
		})
		.attr('r', 3)
	;
	columns.append('text')
		.attr('class', 'chart')
		.attr('x', function(d,i) {
			return cmid;
		})
		.attr('y', function(d,i) {
			return y(d.max) - 10;
		})
		.text(function(d) {
			return d3.round(d.max,places) + tick_label;
		})
	;

	// lower bound
	columns.append('circle')
		.attr('class', 'chart')
		.attr('cx', function(d,i) {
			return cmid;
		})
		.attr('cy', function(d,i) {
			return y(d.min);
		})
		.attr('r', 3)
	;
	columns.append('text')
		.attr('class', 'chart')
		.attr('x', function(d,i) {
			return cmid;
		})
		.attr('y', function(d,i) {
			return y(d.min) + 18;
		})
		.text(function(d) {
			return d3.round(d.min,places) + tick_label;
		})
	;

	// diff
	columns
		.append('rect')
		.attr('class', 'diff')
		.attr('x', function(d,i) {
			return cmid - 37;
		})
    	.attr("rx", 3)
		.attr('y', function(d) {
			return y(d.mean) - 25;
		})
		.attr('width', function(d,i) {
			return 74;
		})
		.attr('height', function(d,i) {
			return 50;
		})
	;
	columns
		.append('text')
		.attr('class', 'diff')
		.attr('x', function(d,i) {
			return cmid;
		})
		.attr('y', function(d) {
			return y(d.mean);
		})
		.attr('dy', '.3em')
		.text(function(d) {
			return d3.round(d.diff, places) + tick_label;
		})
	;

	// y axis
	var yAxis = d3.svg.axis()
    .scale(y)
    //.ticks(10)
    .orient('left')
  ;

	g.append("g")
		.attr("class", "y axis")
		.attr('transform', 'translate(-10,0)')
		.call(yAxis)
	;

	g.append("text")
		.attr('class', 'chart axis')
		.attr("transform", "translate(0," + start_y + ") rotate(-90)")
		.attr("dy", "1em")
		.style("text-anchor", "end")
		.text("Sample Thickness (mm)");

}