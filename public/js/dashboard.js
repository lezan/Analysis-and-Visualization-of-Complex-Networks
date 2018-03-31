$(document).ready(function() {

	$("#playButtonSection5").hide();

	$(".nav a").on("click", function(){
		$(".nav").find(".active").removeClass("active");
		$(this).parent().addClass("active");
	});

	var server = false;

	/* Section 1 variables (map) */
	var tooltip,
		gMap,
		active,
		path,
		svgMap,
		zoom,
		widthMap,
		heightMap;

	/* Variables (section 2, most of all) */
	var selectedCountry;
	var lastClickedCountry;

	/* Line chart variables */
	var foreground,
		line;

	/* Section 3 variables */
	var copyData;
	var copyGeoJSON;
	var methodSelected;
	var yearSelected;
	var choroplethMap;
	var geojsonLayer;
	var info;

	/* Section 4 */
	var copyCountryName;

	/* Section 5 */
	var copyWorld;
	var attributeArray = [];
	var currentAttribute = 0;
	var playing = false;

	var q = d3_queue.queue();
	//q.defer(d3.json, "api/data");
	q.defer(d3.csv, "data/data.csv");
	q.defer(d3.json, "data/world-50m.json");
	q.defer(d3.tsv, "data/world-name.tsv");
	q.defer(d3.tsv, "data/world-country-names.tsv")
	q.defer(d3.json, "data/final2.geojson");
	q.await(ready);

	/* Init function */
	function ready(error, data, world, countryName, countryNameSelector, GeoJSON) {
		formatDataName(data, 1);
		formatDataName(GeoJSON.features, 2);
		formatYears(data, 1);
		formatYears(GeoJSON.features, 2);
		formatDataValuesAsNumbers(data, 1);
		formatDataValuesAsNumbers(GeoJSON.features, 2);
		sortData(data, 1);
		copyData = data;
		sortData(GeoJSON.features, 2);
		copyGeoJSON = GeoJSON;
		makeMap(data, world, countryNameSelector);
		makePlaceHolderChoroplethMap();
		copyCountryName = countryName;
		createSelectsSection4();
		copyWorld = world;
		animateChoroplethMap();
	}

	/* Prototype */
	Element.prototype.remove = function() {
		this.parentElement.removeChild(this);
	}

	NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
		for(var i = this.length - 1; i >= 0; i--) {
			if(this[i] && this[i].parentElement) {
				this[i].parentElement.removeChild(this[i]);
			}
		}
	}

	/* START Data format */
	function formatDataName(data, variant) {
		if(variant == 1) {
			data.forEach(
				function(d) {
					d.country = d.Country;
					delete d.Country;
					d.isoCode = d.ISO_code;
					delete d.ISO_code;
					d.years = d.Years;
					delete d.Years;
					d.age = d.Age;
					delete d.Age;
					d.anyMethod = d.Any_method;
					delete d.Any_method;
					d.anyModernMethod = d.Any_modern_method;
					delete d.Any_modern_method;
					d.femaleSterilization = d.Female_Sterilization;
					delete d.Female_Sterilization;
					d.maleSterilization = d.Male_Sterilization;
					delete d.Male_Sterilization;
					d.pill = d.Pill;
					delete d.Pill;
					d.injectable = d.Injectable;
					delete d.Injectable;
					d.iud = d.IUD;
					delete d.IUD;
					d.maleCondom = d.Male_condom;
					delete d.Male_condom;
					d.vaginalBarrierMethods = d.Vaginal_barrier_methods;
					delete d.Vaginal_barrier_methods;
					d.implant = d.Implant;
					delete d.Implant;
					d.otherModernMethods = d.Other_modern_methods;
					delete d.Other_modern_methods;
					d.anyTraditionalMethod = d.Any_traditional_method;
					delete d.Any_traditional_method;
					d.rhythm = d.Rhythm;
					delete d.Rhythm;
					d.withdrawal = d.Withdrawal;
					delete d.Withdrawal;
					d.otherTraditionalMethods = d.Other_traditional_methods;
					delete d.Other_traditional_methods;
				}
			);
		}
		else {
			data.forEach(
				function(d) {
					d.properties.country = d.properties.Country;
					delete d.properties.Country;
					d.properties.isoCode = d.properties.ISO_code;
					delete d.properties.ISO_code;
					d.properties.years = d.properties.Years;
					delete d.properties.Years;
					d.properties.age = d.properties.Age;
					delete d.properties.Age;
					d.properties.anyMethod = d.properties.Any_method;
					delete d.properties.Any_method;
					d.properties.anyModernMethod = d.properties.Any_modern_method;
					delete d.properties.Any_modern_method;
					d.properties.femaleSterilization = d.properties.Female_Sterilization;
					delete d.properties.Female_Sterilization;
					d.properties.maleSterilization = d.properties.Male_Sterilization;
					delete d.properties.Male_Sterilization;
					d.properties.pill = d.properties.Pill;
					delete d.properties.Pill;
					d.properties.injectable = d.properties.Injectable;
					delete d.properties.Injectable;
					d.properties.iud = d.properties.IUD;
					delete d.properties.IUD;
					d.properties.maleCondom = d.properties.Male_condom;
					delete d.properties.Male_condom;
					d.properties.vaginalBarrierMethods = d.properties.Vaginal_barrier_methods;
					delete d.properties.Vaginal_barrier_methods;
					d.properties.implant = d.properties.Implant;
					delete d.properties.Implant;
					d.properties.otherModernMethods = d.properties.Other_modern_methods;
					delete d.properties.Other_modern_methods;
					d.properties.anyTraditionalMethod = d.properties.Any_traditional_method;
					delete d.properties.Any_traditional_method;
					d.properties.rhythm = d.properties.Rhythm;
					delete d.properties.Rhythm;
					d.properties.withdrawal = d.properties.Withdrawal;
					delete d.properties.Withdrawal;
					d.properties.otherTraditionalMethods = d.properties.Other_traditional_methods;
					delete d.properties.Other_traditional_methods;
				}
			);
		}
	}

	function formatYears(data, variant) {
		if(variant == 1) {
			data.forEach(
				function(d, index) {
					if(typeof d.years === "string" && d.years.includes("-")) {
						var temp = d.years.split("-");
						var count = temp[temp.length - 1] - temp[0];
						d.years = parseInt(temp[0]);
						for(var i = 0; i < count; i++) {
							var newData = jQuery.extend({}, d);
							newData.years = parseInt(temp[0]) + i + 1;
							data.push(newData);
						}
					}
				}
			)
		}
		else {
			data.forEach(
				function(d, index) {
					if(typeof d.properties.years === "string" && d.properties.years.includes("-")) {
						var temp = d.properties.years.split("-");
						var count = temp[temp.length - 1] - temp[0];
						d.properties.years = parseInt(temp[0]);
						for(var i = 0; i < count; i++) {
							var newData = jQuery.extend(true, {}, d);
							newData.properties.years = parseInt(temp[0]) + i + 1;
							data.push(newData);
						}
					}
				}
			)
		}
	}

	function formatDataValuesAsNumbers(data, variant) {
		if(variant == 1) {
			data.forEach(
				function(d) {
					for(var property in d) {
						if(typeof d[property] === "string" && property != "Country") {
							d[property] = d[property].replace(/,/g,".");
						}
						if(property != "_id" && property != "years" && property != "isoCode" && property != "country" && property != "age") {
							d[property] = parseFloat(d[property]);
							d[property] = d[property] / 100;
						}
						if(property == "years") {
							d[property] = parseInt(d[property]);
						}
						if(server === false) {
							if(property === "isoCode") {
								d[property] = parseInt(d[property]);
							}
						}
					}
				}
			)
		}
		else {
			data.forEach(
				function(d) {
					for(var property in d.properties) {
						if(typeof d.properties[property] === "string" && property != "Country" && (property == "anyMethod" || property || "anyModernMethod" || property == "femaleSterilization" || property == "maleSterilization" || property == "pill" || property == "injectable" || property == "iud" || property == "maleCondom" || property == "vaginalBarrierMethods" || property == "implant" || property == "otherModernMethods" || property == "anyTraditionalMethod" || property == "rhythm" || property == "withdrawal" || property == "otherTraditionalMethods")) {
							d.properties[property] = d.properties[property].replace(/,/g,".");
						}
						if(property == "anyMethod" || property == "anyModernMethod" || property == "femaleSterilization" || property == "maleSterilization" || property == "pill" || property == "injectable" || property == "iud" || property == "maleCondom" || property == "vaginalBarrierMethods" || property == "implant" || property == "otherModernMethods" || property == "anyTraditionalMethod" || property == "rhythm" || property == "withdrawal" || property == "otherTraditionalMethods") {
							d.properties[property] = parseFloat(d.properties[property]);
							//d.properties[property] = d.properties[property] / 100;
						}
						if(property == "years") {
							d.properties[property] = parseInt(d.properties[property]);
						}
					}
				}
			)
		}
	}

	function sortData(data, variant) {
		if(variant == 1) {
			data.sort(
				firstBy(
					function(d) {
						return d.country;
					}
				)
				.thenBy("years")
			);
		}
		else {
			data.sort(
				firstBy(
					function(d) {
						return d.properties.country;
					}
				)
				.thenBy(
					function(d) {
						return d.properties.years;
					}
				)
			);
		}
	}
	/* END Data format */

	/* START Event handlers */	
	$("#methodSelected").change(
		function(){
			var temp = document.getElementById("methodSelected");
			methodSelected = temp.options[temp.selectedIndex].value;

			var years = getYearsByMethod(methodSelected);
			years = years.sort(
				function (a, b) {  
					return a - b;  
				}
			);
			years = deduplicate(years);
			var yearsOptionList = "";
			var length = years.length;
			for(var i = 0; i < length; i++) {
				yearsOptionList += "<option value='" + years[i] + "'>" + years[i] + "</option>";
			}
			$('select[name="yearSelected"]').append(yearsOptionList);
		}
	);

	$("#yearSelected").change(
		function(){
			var temp = document.getElementById("yearSelected");
			yearSelected = parseInt(temp.options[temp.selectedIndex].value);
			makeChoroplethMap();
		}
	);

	$("#country1").change(
		function() {
			var country1 = document.getElementById("country1");
			var country1Value = parseInt(country1.options[country1.selectedIndex].value);

			var country2 = document.getElementById("country2");
			var country2Value = parseInt(country2.options[country2.selectedIndex].value);

			var methodSection4Selected = document.getElementById("methodSection4");
			var methodSection4SelectedValue = methodSection4Selected.options[methodSection4Selected.selectedIndex].value;

			if(!isNaN(country1Value) && !isNaN(country2Value) && methodSection4SelectedValue !== "") {
				console.log("entro1");
				var dataset = prepareDatasetSection4(country1Value, country2Value, methodSection4SelectedValue);
				var data = prepareDataSection4(country1Value, country2Value, methodSection4SelectedValue);
				makeDifferentChart(data, getNameFromId(country1Value), getNameFromId(country2Value));
				var copyDataset = copy(dataset);
				makeScatterPlotChart(dataset, getNameFromId(country1Value), getNameFromId(country2Value), methodSection4SelectedValue);
				makeDataTable(copyDataset, methodSection4SelectedValue);
			}
		}
	);

	$("#country2").change(
		function() {
			var country1 = document.getElementById("country1");
			var country1Value = parseInt(country1.options[country1.selectedIndex].value);

			var country2 = document.getElementById("country2");
			var country2Value = parseInt(country2.options[country2.selectedIndex].value);

			var methodSection4Selected = document.getElementById("methodSection4");
			var methodSection4SelectedValue = methodSection4Selected.options[methodSection4Selected.selectedIndex].value;

			if(!isNaN(country1Value) && !isNaN(country2Value) && methodSection4SelectedValue !== "") {				console.log("entro2");
				var dataset = prepareDatasetSection4(country1Value, country2Value, methodSection4SelectedValue);
				var data = prepareDataSection4(country1Value, country2Value, methodSection4SelectedValue);
				makeDifferentChart(data, getNameFromId(country1Value), getNameFromId(country2Value));
				var copyDataset = copy(dataset);
				makeScatterPlotChart(dataset, getNameFromId(country1Value), getNameFromId(country2Value), methodSection4SelectedValue);
				makeDataTable(copyDataset, methodSection4SelectedValue);
			}
		}
	);

	$("#methodSection4").change(
		function() {
			var country1 = document.getElementById("country1");
			var country1Value = parseInt(country1.options[country1.selectedIndex].value);

			var country2 = document.getElementById("country2");
			var country2Value = parseInt(country2.options[country2.selectedIndex].value);

			var methodSection4Selected = document.getElementById("methodSection4");
			var methodSection4SelectedValue = methodSection4Selected.options[methodSection4Selected.selectedIndex].value;

			if(!isNaN(country1Value) && !isNaN(country2Value) && methodSection4SelectedValue !== "") {
				var dataset = prepareDatasetSection4(country1Value, country2Value, methodSection4SelectedValue);
				var data = prepareDataSection4(country1Value, country2Value, methodSection4SelectedValue);
				makeDifferentChart(data, getNameFromId(country1Value), getNameFromId(country2Value));
				var copyDataset = copy(dataset);
				makeScatterPlotChart(dataset, getNameFromId(country1Value), getNameFromId(country2Value), methodSection4SelectedValue);
				makeDataTable(copyDataset, methodSection4SelectedValue);
			}
		}
	);

	$("#methodSelectedSection5").change(
		function() {
			$("#playButtonSection5").show();
			checkAndCreate("choroplethAnimatedContainer", "col-sm-12", "section5", "div", 0);
			currentAttribute = 0;
			makeAnimatedChoroplethMap($("#methodSelectedSection5").val());
		}
	);
	/* END Event handlers */

/* START Draw charts and maps */

	/* START Section 1 */
	function makeMap(data, world, countryName) {
		widthMap = $("#mapContainer").width(),
			heightMap = 500;
		active = d3.select(null);

		var projection = d3.geo
			.equirectangular()
			//.center([0,25])
			.scale(150)
			.translate([widthMap / 2, heightMap / 2]);

		zoom = d3.behavior
			.zoom()
			.translate([0, 0])
			.scale(1)
			.scaleExtent([1, 8])
			.on("zoom", zoomedMap);

		path = d3.geo
			.path()
			.projection(projection);

		tooltip = d3.select("body")
			.append("div")
			.attr("class", "tooltipMap")
			.style("opacity", 1e-6)
			.style("background", "rgba(250,250,250,.7)");

		svgMap = d3.select("#mapContainer")
			.append("svg")
			.attr("width", widthMap)
			.attr("height", heightMap)
			.on("click", stoppedMap, true);

		svgMap.append("rect")
			.attr("class", "background")
			.attr("width", widthMap)
			.attr("height", heightMap)
			.on("click", resetMap);

		gMap = svgMap.append("g");

		svgMap.call(zoom)
			.call(zoom.event);

		gMap.selectAll("path")
			.data(topojson.feature(world, world.objects.countries).features)
			.enter()
			.append("path")
			.attr("d", path)
			.attr("class", "feature")
			.on("click.click", clickedMap)
			.on("click.select", function(d) {
				selectCountry(d.id);
			})
			.on("click.make", function() {
				makeLineChart(data);
			})
			.on("mouseover", function(d) {
				setNameCountryOnTooltip(d.id, countryName);
				d3.select(this)
					.transition()
					.duration(300)
					.style("opacity", 1);
				tooltip.transition()
					.duration(300)
					.style("opacity", 1)
					.style("left", (d3.event.pageX) + "px")
					.style("top", (d3.event.pageY - 30) + "px");
			})
			.on("mouseout", function() {
				d3.select(this)
					.transition().duration(300)
					.style("opacity", 0.8);
				tooltip.transition()
					.duration(300)
					.style("opacity", 0);
		});
		gMap.append("path")
			.datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
			.attr("class", "mesh")
			.attr("d", path);
	}
	/* END Section 1 */

	/* START Section 2 */
	function makeLineChart(data) {

		if(checkCountryExist(data) == false) {
			alert("No data for this country!");
			return;
		}

		if(selectedCountry == lastClickedCountry) {
			document.getElementById("section2").remove();
			lastClickedCountry = "";
			return;
		}

		checkAndCreate("section2", "row-fluid clearfix section", "centralSection","div", 1);

		checkAndCreate("section2-header", "sub-header titleSection", "section2", "h5", 0);

		document.getElementById("section2-header").innerHTML = "It is a <strong>Line Chart!</strong>";

		
		$('#section2-header').popover({
			title: "Info about line chart",
			animation: "true",
			content: "It is a line chart that display info on selected country. Click on circles to see more info about selected country and year.",
			placement: "top",
			trigger: "hover"
		});

		checkAndCreate("lineChartContainer", "col-sm-6", "section2", "div", 0);

		checkAndCreate("barChartContainer", "col-sm-6", "section2", "div", 2);

		var test = JSON.parse(JSON.stringify(data));
		test = test.filter(
			function(d) {
				return (d.isoCode == selectedCountry);
			}
		)

		var appendTitle = document.getElementById("section2-header");
		appendTitle.innerHTML = appendTitle.innerHTML + "<small> Selected country:</small> <strong>" + test[0].country + "</strong>";

		var margin = 
			{
				top: 20,
				right: 80,
				bottom: 30,
				left: 50
			},
			width = $("#lineChartContainer").width() - margin.left - margin.right,
			height = 400 - margin.top - margin.bottom;
	
		var parseDate = d3.time.format("%Y").parse;

		var formatPercent = d3.format(".1%");

		var x = d3.time
			.scale()
			.range([0, width - 50]);

		var y = d3.scale
			.linear()
			.range([height, 0]);

		var color = d3.scale
			.category10();

		var xAxis = d3.svg
			.axis()
			.scale(x)
			.orient("bottom");

		var yAxis = d3.svg
			.axis()
			.scale(y)
			.orient("left")
			.tickFormat(formatPercent);

		var line = d3.svg
			.line()
			.interpolate("linear")
			.x(
				function(d) {
					return x(d.year);
				}
			)
			.y(
				function(d) {
					return y(d.value);
				}
			);

		var svg = d3.select("#lineChartContainer")
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + (margin.left - 5) + "," + margin.top + ")")
		
		color.domain(
			d3.keys(test[0])
				.filter(
					function(key) {
						return key == "anyModernMethod" || key == "anyTraditionalMethod";
						//return key !== "_id" && key !== "country" && key !== "isoCode" && key !== "years" && key !== "age";
					}
				)
		);

		test.forEach(
			function(d) {
				d.years = parseDate(d.years.toString());
			}
		);

		var methods = color.domain()
			.map(
				function(method) {
					return {
						name: method,
						values: test.map(
							function(d) {
								return {
									year: d.years,
									value: +d[method]
								};
							}
						)
					};
				}
			);

		x.domain(
			d3.extent(test,
				function(d) {
					return d.years;
				}
			)
		);

		y.domain(
			[
				d3.min(methods,
					function(c) {
						return d3.min(c.values,
							function(v) {
								return v.value;
							}
						);
					}
				),
				d3.max(methods,
					function(c) {
						return d3.max(c.values,
							function(v) {
								return v.value;
							}
						);
					}
				)
			]
		);

		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		svg.append("g")
			.attr("class", "y axis")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Values (%)");

		var method = svg.selectAll(".method")
			.data(methods)
			.enter()
			.append("g")
			.attr("class", "method")
			.attr("id",
				function(d) {
					return d.name + "-method";
				}
			);

		method.append("path")
			.attr("class", "line")
			.attr("id",
				function(d){ 
					return d.name + "-line"; 
				}
			)
			.attr("d",
				function(d) {
					return line(d.values);
				}
			)
			.style("stroke",
				function(d) {
					return color(d.name);
				}
			)
			.style("stroke-width", "1.5px")
			.on("mouseover",
				function(d) {
					d3.select(this)
						.style("stroke-width", "4px");

					var selectedMethod = d.name;
					d3.selectAll(".method")
						.style("opacity",
							function(e) {
								return (e.name === selectedMethod) ? 1.0 : 0.2;
							}
						);

					var selectedLegend = document.getElementById(d.name + "-legend");
					var notSelectedLegends = $(".legend").not(selectedLegend);
					d3.selectAll(notSelectedLegends)
						.style("opacity", 0.2);
				}
			)
			.on("mouseout",
				function(d) {
					d3.select(this)
						.style("stroke-width", "1.5px");

					var selectedMethod = document.getElementById(d.name + "-line");
					var notSelectedMethods = $(".method").not(selectedMethod);
					d3.selectAll(notSelectedMethods)
						.style("opacity", 1);

					var selectedLegend = document.getElementById(d.name + "-legend");
					var notSelectedLegends = $(".legend").not(selectedLegend);
					d3.selectAll(notSelectedLegends)
						.style("opacity", 1);
				}
			);

		var tip = d3.tip()
			.attr('class', 'd3-tip')
			.offset([-10, 0])
			.html(
				function(d) {
					return "<strong>Value:</strong> <span style='color:brown'>" + d.value*100 + "%</span>";
				}
			);

		svg.call(tip)

		var point = method.append("g")
			.attr("class", "line-point");

		point.selectAll("circle")
			.data(
				function(d) {
					return d.values;
				}
			)
			.enter()
			.append("circle")
			.attr("r", 3)
			.attr("cx", 
				function(d) {
					return x(d.year);
				}
			)

			.attr("cy", 
				function(d) {
					return y(d.value);
				}
			)
			.style("fill",
				function(d) {
					return color(this.parentNode.__data__.name);
				}
			)
			
			.on("click", 
				function(d) {
					makeBarChart(test, d.year, this.parentNode.parentNode.getAttribute("id"));
				}
			)
			.on("mouseover", tip.show)
			.on("mouseout", tip.hide);

		var legend = svg.selectAll(".legend")
			.data(methods)
			.enter()
			.append("g")
			.attr("class", "legend")
			.attr("id",
				function(d){ 
					return d.name + "-legend";
				}
			)
			.attr("transform", 
				function(d, i) {
					return "translate(" + (-15) + ", " + i + ")";
				}
			);

		legend.append("circle")
			.attr("cx", width - 20)
			.attr("cy", 
				function(d, i) {
					return i * 20;
				}
			)
			.attr("r", 7)
			.attr("width", 10)
			.attr("height", 10)
			.style("fill",
				function(d) {
					return color(d.name);
				}
			)
			.on("mouseover",
				function(d) {
					var selectedLegend = d.name;
					d3.selectAll(".legend")
						.style("opacity",
							function(e) {
								return (e.name === selectedLegend) ? 1.0 : 0.2;
							}
						);

					var selectedMethod = d.name;
					d3.selectAll(".method")
						.style("stroke-width",
							function(e) {
								return (e.name === selectedMethod) ? "4.5px" : "1.5px";
							}
						);

					d3.selectAll(".method")
						.style("opacity",
							function(e) {
								return (e.name === selectedMethod) ? 1.0 : 0.2;
							}
						);/*
						.style("stroke-width",
							function(e) {
								return (e.name === selectedMethod) ? "4.5px" : "1.5px";
							}
						);			*/	
				}
			)
			.on("mouseout",
				function(d) {
					var selectedLegend = d.name;
					d3.selectAll(".legend")
						.style("opacity",
							function(e) {
								if(e.name !== selectedLegend) {
									return 1;
								}
							}
					);

					var selectedMethod = d.name;
					d3.selectAll(".method")
						.style("opacity",
							function(e) {
								if(e.name !== selectedLegend) {
									return 1;
								}
							}
						)
					.style("stroke-width",
						function(e) {
							if(e.name === selectedMethod) {
								return "1.5px";
							}
						}
					);		
				}
			);

		legend.append("text")
			.attr("x", width - 8)
			.attr("y",
				function(d, i) {
					return i * 20;
				}

			)
			.text(
				function(d) {
					return formatName(d.name);
				}	
			)
			.on("click", 
				function(d){
					var active   = d.active ? false : true,
						newOpacity = active ? 0 : 1;
					var selectedMethod = d.name;
					d3.selectAll(".method")
						.transition().duration(100)
						.style("opacity",
							function(e) {
								if(e.name === selectedMethod) {
									return newOpacity;
								}
							}
						);
					d.active = active;
				}
			);

        lastClickedCountry = selectedCountry;
	}

	function makeBarChart(data, yearSelected, id) {
		checkAndCreate("barChartContainer", "col-sm-6", "section2", "div", 0);

		var selectedMethod = id.replace("-method","");
		
		var subModernMethods =
			[
			"femaleSterilization",
			"maleSterilization",
			"pill",
			"injectable",
			"iud",
			"maleCondom",
			"vaginalBarrierMethods",
			"implant",
			"otherModernMethods"
			];

		var subTraditionalMethods =
			[
			"rhythm",
			"withdrawal",
			"otherTraditionalMethods"
			];

		var dataSelected = JSON.parse(JSON.stringify(data));
		dataSelected = dataSelected.filter(
			function(d) {
				var temp = new Date(d.years);
				return (temp.getFullYear() == yearSelected.getFullYear());
			}
		);

		for(var i = 0; i < dataSelected.length; i++) {
			delete dataSelected[i]["_id"];
			delete dataSelected[i].age
			delete dataSelected[i].country;
			delete dataSelected[i].anyMethod;
			delete dataSelected[i].anyModernMethod;
			delete dataSelected[i].anyTraditionalMethod;
			delete dataSelected[i].isoCode;
			delete dataSelected[i].years;
		}

		if(selectedMethod != "anyModernMethod") {
			for(var k = 0; k < dataSelected.length; k++) {
				for(var i = 0; i < subModernMethods.length; i++) {
					var temp = subModernMethods[i];
					delete dataSelected[k][temp];
				}
			}
		}
		else {
			for(var k = 0; k < dataSelected.length; k++) {
				for(var i = 0; i < subTraditionalMethods.length; i++) {
					var temp = subTraditionalMethods[i];
					delete dataSelected[k][temp];
				}
			}
		}

		var test = [];
		for(var method in dataSelected[0]) {
			var temp = {method: method, value: dataSelected[0][method]};
			test.push(temp);
		}

		var margin = 
			{
				top: 20, 
				right: 20, 
				bottom: 30, 
				left: 40
			},
			width = $("#barChartContainer").width() - margin.left - margin.right,
			height = 400 - margin.top - margin.bottom;

		var formatPercent = d3.format(".1%");

		var x = d3.scale
			.ordinal()
			.rangeRoundBands([0, width], .1);

		var y = d3.scale
			.linear()
			.range([height, 0]);

		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom")
			.tickFormat(
				function(d) {
					return formatName(d);
				}
			);

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.tickFormat(formatPercent);

		var svg = d3.select("#barChartContainer")
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + (margin.left + 10) + "," + margin.top + ")");

		x.domain(
			test.map(
				function(d) {
					return d.method;
				}
			)
		);
		y.domain(
			[0, d3.max(test,
					function(d) {
						return d.value;
					}
				)
			]
		);

		svg.append("g")
			.attr("class", "x axis barChart")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.selectAll(".tick text")
			.call(wrap, x.rangeBand());

		svg.append("g")
			.attr("class", "y axis barChart")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Values (%)");

		var tip = d3.tip()
			.attr('class', 'd3-tip')
			.offset([-10, 0])
			.html(
				function(d) {
					return "<strong>Value:</strong> <span style='color:brown'>" + d.value*100 + "%</span>";
				}
			);

		svg.call(tip)

		svg.selectAll(".bar")
			.data(test)
			.enter()
			.append("rect")
			.attr("class", "bar")
			.attr("x",
				function(d) {
					return x(d.method); 
				}
			)
			.attr("width", x.rangeBand())
			.attr("y",
				function(d) { 
					return y(d.value);
				}
			)
			.attr("height",
				function(d) { 
					return height - y(d.value);
				}
			)
			.style("fill", "steelblue")
			.on("mouseover.color",
				function(d) {
					d3.select(this)
						.style("fill", "brown");
				}
			)
			.on("mouseout.color",
				function(d) {
					d3.select(this)
						.style("fill", "steelblue");
				}
			)
			.on("mouseover.values", tip.show)
			.on("mouseout.values", tip.hide);

		svg.append("text")
			.attr("class", "infoBarChart")
			.attr("x", 570)
			.attr("y", 10)
			.text("Years selected: " + yearSelected.getFullYear());

		svg.append("text")
			.attr("class", "infoBarChart")
			.attr("x", 570)
			.attr("y", -7)
			.text("Method selected: " + formatName(selectedMethod));
	}
	/* END Section 2 */

	/* START Section 3 */
	function makePlaceHolderChoroplethMap() {

		choroplethMap = L.map('choroplethContainer').setView([51.505, -0.09], 2);

		var urlLight = "https://api.mapbox.com/styles/v1/{id}/cipbbzr8m0046dlnp5y65igpv/tiles/{z}/{x}/{y}?access_token={accessToken}";
		var urlDark = "https://api.mapbox.com/styles/v1/{id}/cip7ftr26001ddcnk852ngm83/tiles/{z}/{x}/{y}?access_token={accessToken}";
		var id = "lezan";
		var accessToken = "pk.eyJ1IjoibGV6YW4iLCJhIjoiY2lwN2VyenNzMDAyaHU4bmxmaTlzNXRzZiJ9.LxjJfSpDRVu-RNeUfh_Xew";
		var attribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>';

		var baseLayers = {
			Light: L.tileLayer(urlLight,
				{
					maxZoom: 18,
					id: id,
					accessToken: accessToken, 
					attribution: attribution
				}
			),
			Dark: L.tileLayer(urlDark,
				{
					maxZoom: 18,
					id: id,
					accessToken: accessToken, 
					attribution: attribution
				}
			),
		};

		var baseLayersCopy = {
			Light: L.tileLayer(urlLight,
				{
					maxZoom: 18,
					id: id,
					accessToken: accessToken, 
					attribution: attribution
				}
			),
			Dark: L.tileLayer(urlDark,
				{
					maxZoom: 18,
					id: id,
					accessToken: accessToken, 
					attribution: attribution
				}
			),
		};

		choroplethMap.addLayer(baseLayers.Dark);

		L.control.layers(baseLayers).addTo(choroplethMap);

		info = L.control();

		info.onAdd = function(map) {
			this._div = L.DomUtil.create('div', 'info');
			this.update();
			return this._div;
		};

		info.update = function(props) {
			this._div.innerHTML = '<h4>Use of any method</h4>' +  (props ?
				'<b>' + props.country + '</b><br />' + props.anyMethod + ' %'
				: 'Hover over a state');
		};

		info.addTo(choroplethMap);

		geojsonLayer = L.geoJson(null,
			{
				style: style,
				onEachFeature: onEachFeature
			}
		).addTo(choroplethMap);	

		var legend = L.control(
			{
				position: "bottomright"
			}
		);

		legend.onAdd = function(map) {

			var div = L.DomUtil.create("div", "info legendChoro"),
				grades = [0, 1, 5, 8, 10, 15, 20, 35, 50, 70, 90],
				labels = [],
				from, to;

			for (var i = 0; i < grades.length; i++) {
				from = grades[i];
				to = grades[i + 1];

				labels.push(
					'<i style="background:' + getColor(from + 1) + '"></i> ' +
					from + (to ? '&ndash;' + to : '+'));
			}

			div.innerHTML = labels.join("<br>");
			return div;
		};

		legend.addTo(choroplethMap);

		var miniMap = new L.Control.MiniMap(baseLayersCopy.Dark, 
			{ 
				toggleDisplay: true,
				position: "bottomleft"
			}
		).addTo(choroplethMap);

		choroplethMap.on("baselayerchange",
			function(e) {
				miniMap.changeLayer(baseLayersCopy[e.name])
			}
		);
	}

	function makeChoroplethMap() {

		geojsonLayer.clearLayers();
		first = false;;
		var data = getGeoJsonByYear(yearSelected);
		geojsonLayer.addData(data);
	}
	/* END Section 3 */

	/* START Section 4 */
	function makeDifferentChart(data, country1, country2) {

		checkAndCreate("differentChartContainer", "col-sm-4", "section4", "div", 0);

		var formatPercent = d3.format(".1%");

		var margin = {
			top: 20, 
			right: 20, 
			bottom: 30, 
			left: 50
		},
		width = $("#differentChartContainer").width() - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

		var x = d3.time.scale()
			.range([0, width - 100]);

		var y = d3.scale.linear()
			.range([height, 0]);

		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom");

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.tickFormat(formatPercent);

		var line = d3.svg.area()
			.interpolate("linear")
			.x(
				function(d) {
					return x(d.year);
				}
			)
			.y(
				function(d) {
					return y(d[country1]);
				}
			);

		var area = d3.svg.area()
			.interpolate("linear")
			.x(
				function(d) {
					return x(d.year);
				}
			)
			.y(
				function(d) {
					return y(d[country1]);
				}
			);

		var svg = d3.select("#differentChartContainer")
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		x.domain(
			d3.extent(data,
				function(d) {
					return d.year;
				}
			)
		);

		y.domain(
			[
				d3.min(data,
					function(d) {
						return Math.min(d[country1], d[country2]);
					}
					),
				d3.max(data,
					function(d) {
						return Math.max(d[country1], d[country2]);
					}
				)
			]
		);

		svg.datum(data);

		svg.append("clipPath")
			.attr("id", "clip-below")
			.append("path")
			.attr("d", area.y0(height));

		svg.append("clipPath")
			.attr("id", "clip-above")
			.append("path")
			.attr("d", area.y0(0));

		svg.append("path")
			.attr("class", "area above")
			.attr("clip-path", "url(#clip-above)")
			.attr("d",
				area.y0(
					function(d) {
						return y(d[country2]);
					}
				)
			);

		svg.append("path")
			.attr("class", "area below")
			.attr("clip-path", "url(#clip-below)")
			.attr("d", area);

		svg.append("path")
			.attr("class", "line2")
			.attr("d", line);

		svg.append("g")
			.attr("class", "x2 axis2")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);

		svg.append("g")
			.attr("class", "y2 axis2")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Value (%)");
	}

	function makeScatterPlotChart(data, country1, country2, method) {

		checkAndCreate("scatterPlotContainer", "col-sm-4", "section4", "div", 0);

		var margin = {
			top: 20, 
			right: 20, 
			bottom: 30, 
			left: 40
		},
		width = $("#scatterPlotContainer").width() - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

		var formatPercent = d3.format(".1%");
		var parseDate = d3.time.format("%Y").parse;

		var x = d3.time
			.scale()
			.range([0, width - 100])
			.nice();

		var y = d3.scale
			.linear()
			.range([height, 0])
			.nice();

		var color = d3.scale.category10();

		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom");

		var yAxis = d3.svg.axis()
			.scale(y)
			.orient("left")
			.tickFormat(formatPercent);

		var svg = d3.select("#scatterPlotContainer")
			.append("svg")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.append("g")
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

		data.forEach(
			function(d) {
				d.years = parseDate(d.years.toString());
			}
		);

		x.domain(
			d3.extent(data,
				function(d) {
					return d.years;
				}
			)
		);
		
		y.domain(
			d3.extent(data, 
				function(d) {
					return d[method];
				}
			)
		);

		var tip = d3.tip()
			.attr('class', 'd3-tip')
			.offset([-10, 0])
			.html(
				function(d) {
					return "<strong>Value:</strong> <span style='color:brown'>" + d[method]*100 + "%</span>";
				}
			);

		svg.call(tip)

		svg.append("g")
			.attr("class", "x3 axis3")
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis)
			.append("text")
			.attr("x", width - 100)
			.attr("y", -6)
			.style("text-anchor", "end")
			.text("Years");

		svg.append("g")
			.attr("class", "y3 axis3")
			.call(yAxis)
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Value (%)")

		svg.selectAll(".dot")
			.data(data)
			.enter().append("circle")
			.attr("class", "dot")
			.attr("r", 3.5)
			.attr("cx",
				function(d) {
					return x(d.years);
				}
			)
			.attr("cy",
				function(d) {
					return y(d[method]);
				}
			)
			.style("fill",
				function(d) {
					return color(d.country);
				}
			)
			.on("mouseover.values", tip.show)
			.on("mouseout.values", tip.hide);

		var legend = svg.selectAll(".legendScatter")
			.data(color.domain())
			.enter().append("g")
			.attr("class", "legendScatter")
			.attr("transform",
				function(d, i) {
					return "translate(0," + i * 20 + ")";
				}
			);

		legend.append("rect")
			.attr("x", width - 18)
			.attr("width", 18)
			.attr("height", 18)
			.style("fill", color);

		legend.append("text")
			.attr("x", width - 24)
			.attr("y", 9)
			.attr("dy", ".35em")
			.style("text-anchor", "end")
			.text(function(d) {
				return d;
			}
		);
	}

	function makeDataTable(data, method) {

		checkAndCreate("dataTableContainer", "col-sm-4", "section4", "div", 0);

		var columns =
			[
				"country",
				"years",
				method,
			];

		data.sort(
				firstBy(
					function(d) {
						return d["years"];
					}
				)
				.thenBy("country")
			);

		var table = d3.select("#dataTableContainer")
			.append("table")
			.attr("class", "table table-hover table-bordered");

		var thead = table.append("thead")
			.attr("class", "thead-default");
		var tbody = table.append("tbody");

		thead.append("tr")
			.selectAll("th")
			.data(columns)
			.enter()
			.append("th")
			.text(
				function(column) {
					if(column === method) {
						return formatName(column) + " (%)";
					}
					else if(column === "country"){
						return "Country";
					}
					else {
						return "Years";
					}
				}
			);

		var rows = tbody.selectAll("tr")
			.data(data)
			.enter()
			.append("tr");

		var cells = rows.selectAll("td")
			.data(
				function(row) {
					return columns.map(
						function(column) {
							return {
								column: column,
								value: row[column]
							};
						}
					);
				}
			)
			.enter()
			.append("td")
			.text(
				function(d) {
					if(d["column"] === method) {
						return d.value*100;
					}
					else {
						return d.value;
					}
				}
			);
	}
	/* END Section 4 */

	/* START Section 5 */
	function makeAnimatedChoroplethMap(method) {
		var width = $("#choroplethAnimatedContainer").width(), 
			height = 680;

		var projection = d3.geo.fahey()
			.scale(170)
			.translate([width / 2, height / 2])
			.precision(.1);

		var path = d3.geo.path()
			.projection(projection);

		var graticule = d3.geo.graticule();

		var svg = d3.select("#choroplethAnimatedContainer")
			.append("svg")
			.attr("width", width)
			.attr("height", height);

		svg.append("defs").append("path")
			.datum({type: "Sphere"})
			.attr("id", "sphere")
			.attr("d", path);

		svg.append("use")
			.attr("class", "stroke")
			.attr("xlink:href", "#sphere");

		svg.append("path")
			.datum(graticule)
			.attr("class", "graticule")
			.attr("d", path);

		var dataset = copy(copyData);
		var data = [];
		var list = [];
		dataset.forEach(
			function(d) {
				if(list.indexOf(d.country) === -1) {
					var obj = {};
					obj["country"] = d.country;
					obj["isoCode"] = d.isoCode;
					obj[d.years] = d[method];
					list.push(d.country);					
					dataset.forEach(
						function(x) {
							if(x.country === d.country) {
								if(x.years !== d.years) {
									obj[x.years] = x[method];
								}
								else {
									if(x[method] > d[method]) {
										obj[d.years] = x[method];
									}
								}
							}
						}
					);
					data.push(obj);
				}
			}
		);

		var copyCopyWorld = copy(copyWorld);

		var countries = copyCopyWorld.objects.countries.geometries;

		for(var i in countries) {
			var obj = {};
			obj["id"] = countries[i].id;
			obj["country"] = getNameFromId(countries[i].id);
			countries[i]["properties"] = obj;
		}

		for (var i in countries) {
			for (var j in data) {
				if(countries[i].properties.id == data[j].isoCode) {
					for(var k in data[j]) {
						if(k != "country" && k != "isoCode") {
							if(attributeArray.indexOf(k) == -1) { 
								attributeArray.push(k);
							}
							countries[i].properties[k] = Number(data[j][k])
						} 
					}
        			break;
				}
			}
		}

		attributeArray.sort();

		d3.select('#clock').text(attributeArray[currentAttribute]);

		svg.selectAll(".country")
			.data(topojson.feature(copyCopyWorld, copyCopyWorld.objects.countries).features)
			.enter().append("path")
			.attr("class", "country")
			.attr("id",
				function(d) { 
					return "code_" + d.properties.id; 
				}, true)
			.attr("d", path)
			.attr("fill", "steelblue")
			.attr("fill-opacity", 0.3);

		var dataRange = getDataRange(attributeArray, currentAttribute);
		d3.selectAll('.country')
			.attr('fill',
				function(d) {
					var temp = getColorSection5(d.properties[attributeArray[currentAttribute]], dataRange)
					if(!isNaN(temp)) {
						return "brown";
					}
					else {
						return "steelblue";
					}
				}
			)
			.attr('fill-opacity',
				function(d) {
					var temp = getColorSection5(d.properties[attributeArray[currentAttribute]], dataRange);
					if(!isNaN(temp)) {
						return temp;
					}
					else {
						return 0.3;
					}
				}
			);
	}
	/* END Section 5 */

/* END Draw charts and maps */

	/* START Utility map section 1 */
	function clickedMap(d) {
		if (active.node() === this) {
			return resetMap();
		}
		active.classed("active", false);
		active = d3.select(this).classed("active", true);
		var bounds = path.bounds(d),
			dx = bounds[1][0] - bounds[0][0],
			dy = bounds[1][1] - bounds[0][1],
			x = (bounds[0][0] + bounds[1][0]) / 2,
			y = (bounds[0][1] + bounds[1][1]) / 2,
			scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / widthMap, dy / heightMap))),
			translate = [widthMap / 2 - scale * x, heightMap / 2 - scale * y];
		svgMap.transition()
			.duration(750)
			.call(zoom.translate(translate).scale(scale).event);
	}

	function resetMap() {
		active.classed("active", false);
		active = d3.select(null);
		svgMap.transition()
			.duration(750)
			.call(zoom.translate([0, 0]).scale(1).event);
	}

	function zoomedMap() {
		gMap.style("stroke-width", 1.5 / d3.event.scale + "px");
		gMap.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}

	function stoppedMap() {
		if (d3.event.defaultPrevented) {
			d3.event.stopPropagation();
		}
	}

	function setNameCountryOnTooltip(id, countryName) {
		countryName.forEach(function(name) {
			if(id == name.id) {
				tooltip.text(name.name)
			}
		})
	}

	function selectCountry(id) {
		selectedCountry = id;
	}
	/* END Utility map section 1 */

	/* START Utility bar chart section 2 */
	function wrap(text, width) {
		text.each(
			function() {
				var text = d3.select(this),
					words = text.text()
						.split(/\s+/)
						.reverse(),
					word,
					line = [],
					lineNumber = 0,
					lineHeight = 1.1, // ems
				y = text.attr("y"),
				dy = parseFloat(text.attr("dy")),
				tspan = text.text(null)
					.append("tspan")
					.attr("x", 0).attr("y", y)
					.attr("dy", dy + "em");
				while (word = words.pop()) {
					line.push(word);
					tspan.text(line.join(" "));
					if (tspan.node().getComputedTextLength() > width) {
						line.pop();
						tspan.text(line.join(" "));
						line = [word];
						tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
					}
				}
    		}
    	);
	}
	/* END Utility bar chart section 2 */

	/* START Utility choropleth map section 3 */
	function getGeoJsonByMethod(method) {
		var data = copy(copyGeoJSON);

		data.features = data.features.filter(
			function(d) {
				return d.properties[method] != 0;
			}
		);

		return data;
	}

	function getGeoJsonByYear(year) {
		var data = copy(copyGeoJSON);

		data.features = data.features.filter(
			function(d) {
				return d.properties["years"] == year;
			}
		);

		return data;
	}

	function getYearsByMethod(method) {
		var years = [];
		copyGeoJSON.features.forEach(
			function(d) {
				if(d.properties[method] != 0) {
					years.push(d.properties["years"]);
				}
			}
		);
		return years;
	}
	/* END Utility choropleth map section 3 */

	/* START Function choropleth map section 3 */
	function getColor(d) {
		return d > 90 ? "#800026" :
			d > 70 ? "#bd0026" :
			d > 50 ? "#e31a1c" :
			d > 35 ? "#fc4e2a" :
			d > 20 ? "#fd8d3c" :
			d > 15 ? "#feb24c" :
			d > 10 ? "#fed976" :
			d > 8 ? "#ffeda0" :
			d > 5 ? "#ffffcc" :
			d > 1 ?	"#ffffe5" :
				"#FFFFFF";
	}

	function style(feature) {
		if(methodSelected == "anyMethod") {
			return {
		 		fillColor: getColor(feature.properties.anyMethod),
				weight: 2,
				opacity: 1,
				color: 'white',
				dashArray: '3',
				fillOpacity: 0.7
			};
		}
		else if(methodSelected == "anyModernMethod") {
			return {
		 		fillColor: getColor(feature.properties.anyModernMethod),
				weight: 2,
				opacity: 1,
				color: 'white',
				dashArray: '3',
				fillOpacity: 0.7
			};
		}
		else if(methodSelected == "femaleSterilization") {
			return {
		 		fillColor: getColor(feature.properties.femaleSterilization),
				weight: 2,
				opacity: 1,
				color: 'white',
				dashArray: '3',
				fillOpacity: 0.7
			};
		}
		else if(methodSelected == "maleSterilization") {
			return {
		 		fillColor: getColor(feature.properties.maleSterilization),
				weight: 2,
				opacity: 1,
				color: 'white',
				dashArray: '3',
				fillOpacity: 0.7
			};
		}
		else if(methodSelected == "pill") {
			return {
		 		fillColor: getColor(feature.properties.pill),
				weight: 2,
				opacity: 1,
				color: 'white',
				dashArray: '3',
				fillOpacity: 0.7
			};
		}
		else if(methodSelected == "injectable") {
			return {
		 		fillColor: getColor(feature.properties.injectable),
				weight: 2,
				opacity: 1,
				color: 'white',
				dashArray: '3',
				fillOpacity: 0.7
			};
		}
		else if(methodSelected == "iud") {
			return {
		 		fillColor: getColor(feature.properties.iud),
				weight: 2,
				opacity: 1,
				color: 'white',
				dashArray: '3',
				fillOpacity: 0.7
			};
		}
		else if(methodSelected == "maleCondom") {
			return {
		 		fillColor: getColor(feature.properties.maleCondom),
				weight: 2,
				opacity: 1,
				color: 'white',
				dashArray: '3',
				fillOpacity: 0.7
			};
		}
		else if(methodSelected == "vaginalBarrierMethods") {
			return {
		 		fillColor: getColor(feature.properties.vaginalBarrierMethods),
				weight: 2,
				opacity: 1,
				color: 'white',
				dashArray: '3',
				fillOpacity: 0.7
			};
		}
		else if(methodSelected == "implant") {
			return {
		 		fillColor: getColor(feature.properties.implant),
				weight: 2,
				opacity: 1,
				color: 'white',
				dashArray: '3',
				fillOpacity: 0.7
			};
		}
		else if(methodSelected == "otherModernMethods") {
			return {
		 		fillColor: getColor(feature.properties.otherModernMethods),
				weight: 2,
				opacity: 1,
				color: 'white',
				dashArray: '3',
				fillOpacity: 0.7
			};
		}
		else if(methodSelected == "anyTraditionalMethod") {
			return {
		 		fillColor: getColor(feature.properties.anyTraditionalMethod),
				weight: 2,
				opacity: 1,
				color: 'white',
				dashArray: '3',
				fillOpacity: 0.7
			};
		}
		else if(methodSelected == "rhythm") {
			return {
		 		fillColor: getColor(feature.properties.rhythm),
				weight: 2,
				opacity: 1,
				color: 'white',
				dashArray: '3',
				fillOpacity: 0.7
			};
		}
		else if(methodSelected == "withdrawal") {
			return {
		 		fillColor: getColor(feature.properties.withdrawal),
				weight: 2,
				opacity: 1,
				color: 'white',
				dashArray: '3',
				fillOpacity: 0.7
			};
		}
		else if(methodSelected == "otherTraditionalMethods") {
			return {
		 		fillColor: getColor(feature.properties.otherTraditionalMethods),
				weight: 2,
				opacity: 1,
				color: 'white',
				dashArray: '3',
				fillOpacity: 0.7
			};
		}
	}

	function highlightFeature(e) {
		var layer = e.target;

		layer.setStyle({
			weight: 5,
			color: '#666',
			dashArray: '',
			fillOpacity: 0.7
		});

		if (!L.Browser.ie && !L.Browser.opera) {
			layer.bringToFront();
		}

		info.update(layer.feature.properties);
	}

	function resetHighlight(e) {
		geojsonLayer.resetStyle(e.target);
		info.update();
	}

	function zoomToFeature(e) {
		choroplethMap.fitBounds(e.target.getBounds());
	}
	
	function onEachFeature(feature, layer) {
		layer.on(
			{
				mouseover: highlightFeature,
				mouseout: resetHighlight,
				click: zoomToFeature
			}
		);
	}
	/* END Function choropleth map section 3 */

	/* START Utility section 4 */
	function createSelectsSection4() {
		var country = [];
		var isoCode = [];
		copyData.forEach(
			function(d) {
				country.push(d.country);
				isoCode.push(d.isoCode);
			}
		);
		country = deduplicate(country);
		isoCode = deduplicate(isoCode);

		var selectsOptionList = "";
		var length = country.length;
		for(var i = 0; i < length; i++) {
			selectsOptionList += "<option value='" + isoCode[i] + "'>" + country[i] + "</option>";
		}
		$('select[name="country1"]').append(selectsOptionList);
		$('select[name="country2"]').append(selectsOptionList);
	}

	function prepareDatasetSection4(country1Value, country2Value, methodSection4SelectedValue) {
		var dataset = copy(copyData);

		dataset = dataset.filter(
			function(d) {
				return (d.isoCode === country1Value || d.isoCode === country2Value);
			}
		);

		dataset.forEach(
			function(d) {
				for(var property in d) {
					if(property != methodSection4SelectedValue && property != "country" && property != "isoCode" && property != "years") {
						delete d[property];
					}
				}
			}
		);

		return dataset;
	}

	function prepareDataSection4(country1Value, country2Value, methodSection4SelectedValue) {

		var dataset = prepareDatasetSection4(country1Value, country2Value, methodSection4SelectedValue );

		var parseDate = d3.time.format("%Y").parse;

		var data = [];
		var list = [];

		for(var i = 0; i < dataset.length; i++) {
			if(list.indexOf(i) === -1) {
				var obj = {};
				obj["year"] = parseDate(dataset[i]["years"].toString());
				obj[dataset[i]["country"]] = dataset[i][methodSection4SelectedValue];
				for(var k = i; k < dataset.length; k++) {
					if(dataset[i]["years"] === dataset[k]["years"] && dataset[i]["country"] !== dataset[k]["country"] && list.indexOf(k) === -1) { // 1 afg 2000, 2 alb 2000 
						obj[dataset[k]["country"]] = dataset[k][methodSection4SelectedValue];
						list.push(k);
						break;
					}
				}
				data.push(obj);
			}
			else {
				continue;
			}
		}

		data.forEach(
			function(d) {
				if (d3.keys(d).length < 3) {
					if(d3.keys(d).indexOf(getNameFromId(country1Value)) === -1 ) {
						d[getNameFromId(country1Value)] = 0;
					}
					if(d3.keys(d).indexOf(getNameFromId(country2Value)) === -1) {
						d[getNameFromId(country2Value)] = 0;
					}
				}
			}
		);

		data.sort(
			firstBy(
				function(d) {
					return d["year"];
				}
			)
		);

		return data;
	}
	/* END Utility section 4 */

	/* START Utility section 5 */
	function getDataRange() {
		var min = Infinity, max = -Infinity;  
		d3.selectAll('.country')
			.each(
				function(d,i) {
					var currentValue = d.properties[attributeArray[currentAttribute]];
					if(currentValue <= min && currentValue != -99 && currentValue != 'undefined') {
						min = currentValue;
				  	}
					if(currentValue >= max && currentValue != -99 && currentValue != 'undefined') {
						max = currentValue;
					}
				}
			);
		return [min,max];
	}

	function getColorSection5(valueIn, valuesIn) {
		var color = d3.scale.linear()
			.domain([valuesIn[0],valuesIn[1]])
			.range([.3,1]);
		return color(valueIn);
	}

	function sequenceMap() {
		var dataRange = getDataRange();
		d3.selectAll('.country')
			.transition()
			.duration(750)
			.attr('fill',
				function(d) {
					var temp = getColorSection5(d.properties[attributeArray[currentAttribute]], dataRange)
					if(!isNaN(temp)) {
						return "brown";
					}
					else {
						return "steelblue";
					}
				}
			)
			.attr('fill-opacity',
				function(d) {
					var temp = getColorSection5(d.properties[attributeArray[currentAttribute]], dataRange);
					if(!isNaN(temp)) {
						return temp;
					}
					else {
						return 0.3;
					}
				}
			);
	}

	function animateChoroplethMap() {
		var timer;

		d3.select('#playButtonSection5')  
			.on('click',
			function() {
				if(playing == false) {
					timer = setInterval(
						function() {
							if(currentAttribute < attributeArray.length - 1) {  
								currentAttribute +=1;
							}
							else {
								currentAttribute = 0;
							}
							sequenceMap();
							d3.select('#clock')
								.text(attributeArray[currentAttribute]);
						},
						2000
					);
					d3.select(this)
						.text('stop');
					playing = true;
				}
				else {
					clearInterval(timer);
					d3.select(this)
						.text('play');
					playing = false;
				}
			}
		);
	}
	/* END Utility section 5 */

	/* START General utility */
	function getNameFromId(id) {
		var result = "";
		copyCountryName.forEach(
			function(name) {
				if(id == name.id) {
					result = name.name;
				}
			}
		);
		return result;
	}

	function checkAndCreate(idContainer, classNameContainer, idParent, typeOfElement, variant) {
		var checkDiv = document.getElementById(idContainer);

		if(checkDiv !== null) {
			document.getElementById(idContainer).remove();
		}

		var iDiv = document.createElement(typeOfElement);
		iDiv.id = idContainer;
		iDiv.className = classNameContainer;
		if(variant == 0) {
			document.getElementById(idParent).appendChild(iDiv);
		}
		else if(variant == 1){
			var parentDiv = document.getElementById(idParent);
			var child = parentDiv.children[2];
			parentDiv.insertBefore(iDiv, child);
		}
		else {
			document.getElementById(idParent).appendChild(iDiv);
			var placeholder = document.createElement("a");
			placeholder.className = "thumbnail";
			placeholder.style.width = "818px";
			placeholder.style.height = "400px";
			placeholder.style.visibility = "hidden";
			iDiv.appendChild(placeholder);
		}
	}

	function checkCountryExist(data) {
		for(var i = 0; i < data.length; i++) {
			if(data[i].isoCode == selectedCountry) {
				return true;
			}
		}
		return false;
	}

	function formatName(name) {
		var hash =
			{
				country: "Country",
		 		isoCode: "ISO code",
		 		years: "Year",
		 		age: "Age",
		 		anyMethod: "Any method",
		 		anyModernMethod: "Any modern method",
		 		femaleSterilization: "Female sterilization",
		 		maleSterilization: "Male sterilization",
		 		pill: "Pill",
		 		injectable: "Injectable",
		 		iud: "IUD",
		 		maleCondom: "Male condom",
		 		vaginalBarrierMethods: "Vaginal barrier methods",
		 		implant: "Implant",
		 		otherModernMethods: "Other modern methods",
		 		anyTraditionalMethod: "Any traditional method",
		 		rhythm: "Rhythm",
		 		withdrawal: "Withdrawal",
		 		otherTraditionalMethods: "Other traditional methods"
			}

		return hash[name];
	}

	function copy(o) {
		var out, v, key;
		out = Array.isArray(o) ? [] : {};
		for (key in o) {
			v = o[key];
			out[key] = (typeof v === "object") ? copy(v) : v;
		}
		return out;
	}

	function deduplicate(data) {
		if (data.length > 0) {
			var result = [];
			data.forEach(
				function(elem) {
					if (result.indexOf(elem) === -1) {
						result.push(elem);
					}
				}
			);
        	return result;
    	}
	}
	/* END General utility */

	/* START Unused */
	function listSubMethod(nameMainMethod) {

		var subModernMethods =
			[
			"femaleSterilization",
			"maleSterilization",
			"pill",
			"injectable",
			"iud",
			"maleCondom",
			"vaginalBarrierMethods",
			"implant",
			"otherModernMethods"
			];

		var subTraditionalMethods =
			[
			"rhythm",
			"withdrawal",
			"otherTraditionalMethods"
			];
		
		var hash = [{subModernMethods},	{subTraditionalMethods}];
		return hash;
	}
	/* END Unused */

	/* START Tooltips and Popovers */
	$('[data-toggle="tooltip"]').tooltip();

	$('[data-toggle="popover"]').popover();
	/* END Tooltips and Popovers */
});