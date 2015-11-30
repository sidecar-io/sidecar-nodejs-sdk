var panels = [
    {
      id: 1,
      enable: 'true',
      panelName: 'My Greenhouse',
      graphType: 'line', // line, bar
      lineEnable: 'true',
      barEnable: 'false',
      variable1: 'Temperature',
      variable2: 'Humidity'
    },
    {
      id: 2,
      enable: 'false',
      panelName: 'Motor Monitor',
      graphType: 'line', // line, bar
      lineEnable: 'true',
      barEnable: 'false',
      variable1: 'Voltage',
      variable2: 'Current'
    },
    {
      id: 3,
      enable: 'false',
      panelName: 'Runner',
      graphType: 'bar', // line, bar
      lineEnable: 'false',
      barEnable: 'true',
      variable1: 'Heart Rate',
      variable2: 'Calories'
    },
    {
      id: 4,
      enable: 'false',
      panelName: 'City Stats',
      graphType: 'line', // line, bar
      lineEnable: 'true',
      barEnable: 'false',
      variable1: 'Population',
      variable2: 'Age'
    }
];

exports.getPanels = function() {
    return panels;
}

exports.getNumberOfPanels = function() {
    var numberOfPanels = panels.length;
    return numberOfPanels;
}

exports.addPanels = function(enable,panelName,graphType,variable1,variable2) {
    var id = panels.length + 1;
    var newPanel =
      {
        id: id,
        enable: enable,
        panelName: panelName,
        graphType: graphType, // line, bar
        variable1: variable1,
        variable2: variable2
      }
    ;
    panels.push(newPanel);
    return panels;
}
