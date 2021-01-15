var svgWidth = 960;
var svgHeight = 600;

var margin = {
  top: 20,
  right: 40,
  bottom: 200,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".chart")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(censusData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(censusData, d => d[chosenXAxis]) * 0.8,
      d3.max(censusData, d => d[chosenXAxis]) * 1.2])
    .range([0, width]);

  return xLinearScale;
}

//a function for updating y-scale variable upon click of label
function yScale(censusData, chosenYAxis) {
    //scales
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(censusData, d => d[chosenYAxis]) * 0.8,
        d3.max(censusData, d => d[chosenYAxis]) * 1.2])
      .range([height, 0]);
  
    return yLinearScale;
}
// function used for updating xAxis var upon click on axis label
function renderXAxis (newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(2000)
    .call(bottomAxis);

  return xAxis;
}

//function used for updating yAxis variable upon click
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(2000)
      .call(leftAxis);
  
    return yAxis;
  }

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(2000)
    .attr("cx", data => newXScale(data[chosenXAxis]))
    .attr("cy", data => newYScale(data[chosenYAxis]))

  return circlesGroup;
}
//function for updating STATE labels
function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    textGroup.transition()
      .duration(2000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));

    return textGroup
}

//function to stylize x-axis values for tooltips
function styleX(value, chosenXAxis) {

    //style based on variable
    //poverty
    if (chosenXAxis === "poverty") {
        return `${value}%`;
    }
    //household income
    else if (chosenXAxis === "income") {
        return `${value}`;
    }
    else {
      return `${value}`;
    }
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  //poverty
  if (chosenXAxis === "poverty") {
    var xlabel = "Poverty:";
  }
  //income
  else if (chosenXAxis === "income") {
    var xlabel = "Median Income:";
  }
    //age
    else {
    var xlabel = "Age:";
      }

//Y label
  //healthcare
  if (chosenYAxis === "healthcare") {
    var yLabel = "Healthcare Rating:"
  }
  //obesity
  else if(chosenYAxis === "obesity") {
    var yLabel = "Obesity Rate:";
  }
  //smoking
  else{
    var yLabel = "Smokers:";
  }

  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([-8, 0])
    .html(function(d) {
      return (`${d.state}<br>${xLabel}, ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}%`);
    });
}
// Retrieve data from the CSV file
d3.csv("./assets/data/data.csv").then(function(censusData) {
  console.log(censusData);

  // parse data
  censusData.forEach(function(data) {
    data.obesity = +data.obesity;
    data.income = +data.income;
    data.smokes = +data.smokes;
    data.age = +data.age;
    data.healthcare = +data.healthcare;
    data.poverty = +data.poverty;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(censusData, chosenXAxis);
  var yLinearScale = yScale(censusData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
  .classed("y-axis", true)
  //.attr
  .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(censusData)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.chosenYAxis))
    .attr("dy", 3)
    .attr("fill", "blue")
    .attr("font-size", "10px")
    .attr("opacity", ".5")
    .text(function(d){return d.abbr});

    // create a group for the x axis labels
    var xLabelsGroup = chartGroup.append("g")
      .attr('transform', `translate(${width / 2}, ${height + 10 + margin.top})`);

    var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%");

    var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

    var incomeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)")

    // create a group for Y labels
    var yLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${0 - margin.left/4}, ${height/2})`);

    var healthcareLabel = yLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 0 - 20)
      .attr("dy", "1em")
      .attr("transform", "rotate(-90)")
      .attr("value", "healthcare")
      .classed("active", true)
      .text("Without Healthcare (%)");
    
    var smokesLabel = yLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 0 - 40)
      .attr("dy", "1em")
      .attr("transform", "rotate(-90)")
      .attr("value", "smokes")
      .classed("inactive", true)
      .text("Smoker (%)");
    
    var obesityLabel = yLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 0 - 60)
      .attr("dy", "1em")
      .attr("transform", "rotate(-90)")
      .attr("value", "obesity")
      .classed("inactive", true)
      .text("Obese (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        // updates x scale for new data
        xLinearScale = xScale(censusData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxis(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //update text 
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
        
        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // change of classes changes text
        if (chosenXAxis === "poverty") {
          povertyLabel.classed("active", true).classed("inactive", false);
          ageLabel.classed("active", false).classed("inactive", true);
          incomeLabel.classed("active", false).classed("inactive", true);
        }
        else if (chosenXAxis === "age") {
          povertyLabel.classed("active", false).classed("inactive", true);
          ageLabel.classed("active", true).classed("inactive", false);
          incomeLabel.classed("active", false).classed("inactive", true);
        }
        else {
          povertyLabel.classed("active", false).classed("inactive", true);
          ageLabel.classed("active", false).classed("inactive", true);
          incomeLabel.classed("active", true).classed("inactive", false);
      }
    }
    });
      //y axis lables event listener
      yLabelsGroup.selectAll("text")
        .on("click", function() {
        var value = d3.select(this).attr("value");

        if(value !=chosenYAxis) {
        //replace chosenY with value  
        chosenYAxis = value;

        //update Y scale
        yLinearScale = yScale(censusData, chosenYAxis);

        //update Y axis 
        yAxis = renderYAxis(yLinearScale, yAxis);

        //Udate CIRCLES with new y
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //update TEXT with new Y values
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        //update tooltips
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);


        //Change of the classes changes text
        if (chosenYAxis === "obesity") {
        obesityLabel.classed("active", true).classed("inactive", false);
        smokesLabel.classed("active", false).classed("inactive", true);
        healthcareLabel.classed("active", false).classed("inactive", true);
        }
        else if (chosenYAxis === "smokes") {
        obesityLabel.classed("active", false).classed("inactive", true);
        smokesLabel.classed("active", true).classed("inactive", false);
        healthcareLabel.classed("active", false).classed("inactive", true);
        }
        else {
        obesityLabel.classed("active", false).classed("inactive", true);
        smokesLabel.classed("active", false).classed("inactive", true);
        healthcareLabel.classed("active", true).classed("inactive", false);
      }
      }
  
});
}); 
