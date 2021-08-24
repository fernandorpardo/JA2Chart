# JA2Chart
A javascript library for linear charts

## DESCRIPTION
JA2Chart may be just another javascript chart library or maybe not. It is designed specifically for:
- linear chart made of a large among of data (tens of thousands)
- zooming in and out and perform horizontal scrolling
- managing more than one curve using two Y-axis
- dynamically update data

You can find a detailed explanation about the project an an example at [iambobot.com](https://www.iambobot.com/en/articles/article_ja2chart_010_intro.php).

## USAGE
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
