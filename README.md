# JA2Chart
A javascript library for linear charts

## Description
JA2Chart may be just another javascript chart library or maybe not. It is designed specifically for:
- linear chart made of a large among of data (tens of thousands)
- zooming in and out and perform horizontal scrolling
- managing more than one curve using two Y-axis
- dynamically update data

You can find a detailed explanation about the project an an example at [iambobot.com](https://www.iambobot.com/en/articles/article_ja2chart_010_intro.php).

## Usage
You need the two files published here:
- JA2Chart.js
- JA2Chart.css

#### HTML code
Add the links to the files in the &lt;head> section:
```html
<link rel="stylesheet" type="text/css" href="styles/JA2Chart.css"> 
<script type="text/javascript" src="scripts/JA2Chart.js"></script>
```
And in the BODY create a &lt;div> of class JA2CHART
```html
<div id="myChart" class="JA2CHART" style="width:1280px;"></div>
```

#### Creating the chart
Let’s assume you have already the data in an array such this:
```javascript
var plot_data_1 = [{"2021-07-10 06:16:53", "1.3422213737499544"}, 
                   {"2021-07-10 06:17:54", "1.3422874444694144"}, 
                    ... 
                  ]
```
To create a chart, we need first to instantiate the JA2Chart class passing as parameter the ID of &lt;div> element of class JA2CHART that we inserted in our HTML code.
```javascript
var miChart= new JA2Chart('myChart', 540);
```
Second, we create the plot from the data array and set a name and color to the plot:
```javascript
var plot_ID1= miChart.Plot(plot_data_1);
miChart.Set(plot_ID1, "ADA", "#0011ee");
```
Third, we create the grid. Make sure you do that after having the plot created for the grid will use the data of the plot to calculate the X and Y axis:
```javascript
miChart.GridDraw();
```
And finally, draw the chart:
```javascript
miChart.Draw(plot_ID1);
```
Done. You should see the chart at this point.

# Going into the details
The JA2Chart’s constructor adds some additional elements. If you inspect the HTML code after instancing the JA2Chart object you will see the following structure:
```html
<div id="myChart" class="JA2CHART" style="width:1280px;">
  <!-- header -->
  <div class="HEADER">
    <div class="BOX_INFO_RANGE"><p></p><p></p><p></p></div>
      <div class="INFO_BOXES_CONTAINER">
        <div>
          <div class="PLOT_INFO">
            <div><div></div><p></p></div>
            <p></p><p></p>
          </div>
          <div class="PLOT_INFO">
            <div><div></div><p></p></div>
            <p></p><p></p>
          </div>
          <div class="PLOT_INFO">
            <div><div></div><p></p></div>
            <p></p><p></p>
          </div>
          <div class="PLOT_INFO">
            <div><div></div><p></p></div>
            <p></p><p></p>
          </div>
        </div>
    </div>
  </div>
  <!-- zoom bar -->
  <div class="ZOOM_BAR"><div></div></div>
  <!-- canvas -->
  <div class="CANVAS_CONTAINER">
    <div class="GRID">
      <canvas width="1280" height="540"></canvas>
    </div>
    <div class="CURSOR">
      <canvas width="1280" height="540"></canvas>
    </div>
    <div class="PLOT">
      <canvas width="1280" height="540"></canvas>
    </div>
    <div class="PLOT">
      <canvas width="1280" height="540"></canvas>
    </div>
    <div class="PLOT">
      <canvas width="1280" height="540"></canvas>
    </div>
    <div class="PLOT">
      <canvas width="1280" height="540"></canvas>
    </div>
  </div>  
</div>
```
The JA2CHART element contains three sections: the HEADER, the ZOOM-BAR and several CANVAS overlaying each other. The HEADER and the ZOOM-BAR are optional.
You don’t need to care about this structure but knowing how it is done may help you to understand how it works.

# Height and width
The JA2CHART's width applies to all the three sections: HEADER, ZOOM-BAR and the CANVAS. Height of each section is set through the JA2Chart.css file. You can set the height of the canvas modifying the CANVAS_CONTAINER class in the CSS file or, optionally, passing the value as parameter in class creation.

Modify other proprieties in the JA2Chart.css file to customize your chart at convenience. For instance, you can change the background color as follows:
```javascript
.JA2CHART
{
  background-color: ivory;
}
```

# The grid
One of the HTML canvas element in the CANVAS section is used to display a tabular arrangement of lines and the X and Y axis.

There are a few things you can customize right after instantiating the JA2Chart object and before calling the GridDraw() method to generate and display the grid.

For instance, you may want to change the left and bottom margin to give room to the labels on the X and Y axis (value is in pixels):
```javascript
miChart.grid_X_OFFSET= 0;  // set to zero to remove the bottom margin
miChart.grid_Y_OFFSET= 12; // set the left side margin to 12 pixels
```
Also you can set the amount of vertical and horizontal lines:
```javascript
miChart.Y_STEPS= 8;  // create 8 horizontal separations (rows)
miChart.X_STEPS= 48; // create 48 vertical separations (columns)
```

#### Grid labels
The grid is calculated out of the data of one of the plots. For that reason, you first need to add at least one plot before creating the grid. The X-axis ranges from the minimum to the maximum X value of the plot and is divided into X_STEPS and a label is calculated. The same is done for the Y-axis.

You can call GridCompute() method before GridDraw() to generate and modify the labels before drawing them, e.g.:
```javascript
miChart.GridCompute();
miChart.ylabels_LEFT[0]= 'Alpha';
miChart.ylabels_LEFT[miChart.ylabels_LEFT.length - 1]= 'Omega';
miChart.GridDraw();
```
GridCompute() is implicit in the GridDraw() method and for that reason GridCompute() is optional and you just need to call GridDraw() to generate and show the grid if you don’t need to do any changes.

The labels are stored in the following arrays:
- xlabels[] - labels of the X-axis
- ylabels_LEFT[] – Y-axis on the left for the first
- ylabels_RIGHT[] - Y-axis on the right side when two axis are created (see later the Double Y axis explanation)

# The header
The HEADER section is enabled for each plot by calling the HeaderEnable() method.
```javascript
miChart.HeaderEnable(plot_ID1);
```
The header shows the value of the plot at the cursor position.

# Zooming and scrolling
The ZoomBar class is part of JA2Chart library and is included in the JA2Chart.js file. When the ZoomBar class is instantiated a control bar for zooming and scrolling is shown between the HEADER and the CANVAS. Customization of this control bar is possible through the ZOOM_BAR element in the JA2Chart.css style sheet.

Zooming is performed with the mouse wheel and managed by the CANVAS. When a zoom event is triggered (this happens when rolling the mouse wheel over the plot), two things happen:
1. The visible area is calculated and the Zoom(a, b) method is called to draw the new grid.
2. A callback is done to the function set by means of the ZoomSetCallback() method. This function is normally the Zoom(a, b) method of the ZoomBar class that is used to redraw the control bar with the size an position according to the (a, b) parameters.
    
The (a, b) parameters are the right and left position of the visible area expressed as a percentage. For instance Zoom(25, 75) shows the plot from the 25% to the 75%, i.e., shows 50% of the plot centered.

Scrolling is performed moving the bar of the ZOOM_BAR element. The call-back notifies the new visible area to the JA2Chart object.

Alternatively you can ignore the ZoomBar class and build your own control for zooming and scrolling, and then call the Zoom(a, b) method of the JA2Chart class to set the visible area.

The following code is enough to create the Zoom bar and set the callback:
```javascript
var ZBar= new ZoomBar(miChart);
miChart.ZoomSetCallback(function(a, b) {if(ZBar) ZBar.Zoom(a, b);});
```
ZoomLastNDays() method is useful to initialize the view with the las N days. The following call set the visible area to the last 2 days:
```javascript
miChart.ZoomLastNDays(2);
```
Which is equivalent to the following:
```javascript
miChart.Zoom(100 x (plot_size_in_days – 2) / plot_size_in_days, 100);
```
Note that JA2Chart Zoom(a, b) method recalculates the grid labels and that any change you may have done to the array labels is lost.

# Double Y axis
JA2Chart manages two Y axis which is useful when you are drawing two curves which value ranges are too different.

Let’s assume we have two arrays of data for two different plots. When we call the Plot(data_array) method we are assigning by default the plot to the left axis (it is the same as Plot(data_array, 0)). To create an Y axis on the right side we explicitly pass a second parameter with value=1, that is, left=0 (default) and right=1.
```javascript
miChart= new JA2Chart('myChart', 540);
var plot_ID1= miChart.Plot(plot_data_1);    // Left Y-axis
miChart.Set(plot_ID1, "ADA", "#0011ee");
var plot_ID2= miChart.Plot(plot_data_2, 1); // Right Y-axis 
miChart.Set(plot_ID2, "Market", "#00bb11");
miChart.GridDraw();
miChart.HeaderEnable(plot_ID1);
miChart.HeaderEnable(plot_ID2);
miChart.Draw(plot_ID1);
miChart.Draw(plot_ID2);
```
If we add a third plot we have to tell which of the two Y axis that plot has to take as reference. We do this by passing the parameter in the Plot() method (no parameter means the left axis is used).

# Transformations
There is a way to perform changes in the data and see the effects. We have three methods in the JA2Chart library to do that:
- PlotClone(plot_ID_to_clone) is used instead of Plot() to create a new plot from an existing one.
- DataGet(plot_ID, data_array) retrieves the data into an array of {X_value:<date in seconds>, Y_value:<float number>} tuples representing a (x, y) coordinate of the chart, where 'x' is a date in seconds and 'y' the value of the function being represented.
- DataUpdate(plot_ID, data_array) is used to update the plot with the transformed data. Only the 'y' value is updated while 'x' remains unchanged.
  
In the example, we are drawing the evolution of the Cardano (ADA) cryptocurrency and a second curve that results of applying a low pass filter (average) to mitigate sampling distortion:
```javascript
// Instantiate the JA2Chart class
miChart= new JA2Chart('myChart', 540);
// Draw the ADA plot
var plot_ID1= miChart.Plot(plot_data_1);
miChart.Set(plot_ID1, "ADA", "#0011ee");
// Create a copy of the ADA plot
var plot_ID2= miChart.PlotClone(plot_ID1);
miChart.Set(plot_ID2, "Average", "#bb1100");
// Get the data
var JA2_data = [];
miChart.DataGet(plot_ID2, JA2_data);	
var plot_data_2 = [];
// Do whatever transformation
AverageMidPonderate(JA2_data, plot_data_2, 80);
// Load back the transformed data into the curve
miChart.DataUpdate(plot_ID2, plot_data_2);
// Enable the header and draw
miChart.GridDraw();
miChart.HeaderEnable(plot_ID1);
miChart.HeaderEnable(plot_ID2);
miChart.Draw(plot_ID1);
miChart.Draw(plot_ID2);
```
Just for completeness, here is AverageMidPonderate() function:
```javascript
function AverageMidPonderate(data_in, data_out, r)
{	
  var n= data_in.length;
  for(var i=0; i<n; i++)
  {
    var a= (i > r) ? (i - r) : i; 
    var b= ((i + r) < n) ? (i + r) : n;
    var avg= 0;
    var run_sum= 0;
    for(var j=a; j<b; j++) 
    {
      if( (j+1) < b)
      {
        var run= ( data_in[j+1].X_value - data_in[j].X_value);
        avg += data_in[j].Y_value * run;	
        run_sum += run;
      }
    }
    avg= (run_sum!=0) ? (avg / run_sum) : 0;
    data_out.push( {X_value: data_in[i].X_value, Y_value: avg} );
  }
}
```
