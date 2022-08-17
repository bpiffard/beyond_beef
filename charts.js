function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    PANEL.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // to make plots mobile responsive
    var config = {responsive: true}
    // 3. Create a variable that holds the samples array. 
    var samplesArray = data.samples;
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var selectedSample = samplesArray.filter(sampleObj => sampleObj.id == sample);
    //  5. Create a variable that holds the first sample in the array.
    var firstSample = selectedSample[0];

    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var ids = firstSample.otu_ids;
    var labels = firstSample.otu_labels;
    var values = firstSample.sample_values;
    
    // Pulling data for the gauge
    var freqArray = data.metadata;
    var selectedFreq = freqArray.filter(sampleObj => sampleObj.id == sample)[0];
    // 3. Create a variable that holds the washing frequency.
    var washingFreq = selectedFreq.wfreq;

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last.
  
    // Creating an array to hold objects containgin the bacteria data so I can sort by values without
    // disconnetcitng them from the ID and label info
    var idValue = [];
    for (var i = 0; i < ids.length; i++) {
      let array = {
        id: ids[i],
        label: labels[i],
        sampleValues: values[i]
      };
      //array[ids[i]] = values[i];
      idValue.push(array);
    };

    // Sort for only top ten
    var topTen = idValue.sort((a,b) => b.sampleValues - a.sampleValues).slice(0,10);

    // Creating arrays to hold the data for the chart
    var xValues = [];
    Object.entries(topTen).forEach((entry) => xValues.push(entry[1].sampleValues));
    var yticks = [];
    Object.entries(topTen).forEach((entry) => yticks.push(`OTU ${entry[1].id}`));
    var hoverText = [];
    Object.entries(topTen).forEach((entry) => hoverText.push(`${entry[1].label}`));


    // 8. Create the trace for the bar chart. 
    var barData = [{
      x: xValues.reverse(),
      y: yticks.reverse(),
      text: hoverText.reverse(),
      type:"bar",
      orientation: "h",
      marker: {
        color: "#8a609e"
      }
  }];
    // 9. Create the layout for the bar chart. 
    var barLayout = {
      title: "Top Ten Bacteria Strains",
      paper_bgcolor: "#BEBEBE",
      plot_bgcolor: "#E6E6E6"
    };
    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout, config);

    // Creating the bubble chart!
    // 1. Create the trace for the bubble chart.
    var bubbleData = [{
      x: ids,
      y: values,
      text: labels,
      mode: "markers",
      marker: {
        size: values,
        color: ids
      }

  }];

    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
      title: "Bacteria Cultures Per Sample",
      xaxis: {title: "OTU ID"},
      paper_bgcolor: "#BEBEBE",
      plot_bgcolor: "#E6E6E6"
    };

    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout, config); 

    // Creating the gauge
    // 4. Create the trace for the gauge chart.
    var gaugeData = [{
      domain: {x: [0, 1], y: [0, 1]},
      value: washingFreq,
      type: "indicator",
      mode:"gauge+number",
      title: {text: "Scrubs per Week"},
      gauge: {
        axis: {range: [null, 10]},
        bar: {color: "black"},
        steps: [
          {range: [0,2], color: "red"},
          {range: [2,4], color: "orange"},
          {range: [4,6], color: "yellow"},
          {range: [6,8], color: "lightgreen"},
          {range: [8,10], color: "green"},
        ]
      }
    }];
    
    // 5. Create the layout for the gauge chart.
    var gaugeLayout = { 
      paper_bgcolor: "#BEBEBE"
    };

    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("gauge", gaugeData, gaugeLayout, config);
  });
}