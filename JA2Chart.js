// ------------------------------------------------------------------------------------------------
// 	Just Another Javascript Chart library
//	Fernando.R 
//
// version 
// 1.0.0 August 2021
// - First version
//
// ------------------------------------------------------------------------------------------------
var JA2Chart_version="1.0.0"
var private_var_Chart_Object= 0;	// Private global variables for event listeners
var MAX_PLOTS= 4;

// JA2CHART CLASS
// You need to include the follwoing HTML in your page
//
// <div id="myChart" class="JA2CHART" style="width:1280px;"></div>
//
// JA2CHART div contains the HEADER, the ZOOM BAR and several CANVAS overlaying each other
// width applies to all the three elements
// CHART_HEIGHT applies to the CANVAS only. 
// HEADER and ZOOM BAR heights are set through CSS. 
// Mofidy the CSS to customize at convenience

class JA2Chart {
	// id is the HTML id tag of the JA2CHART class <div>
	// CHART_HEIGHT is the height of the canvas
	constructor(id, CHART_HEIGHT= 540) 
	{
		private_var_Chart_Object= this;
		this.id= id;

		this.N_curves= 0;	// N curves added through plot
		this.N_grids= 0;	// N grids added through GridYaxisAssign
		
		var eChart= document.getElementById(id);
		if(eChart == null) {
			console.log("--- ERROR constructor - no element found of id= " + id);
			return;			
		}
		
		// --------------------------------------------------------------------------------------------
		// CREATE HTML part
		if(!eChart.classList.contains("JA2CHART")) eChart.classList.add("JA2CHART");
		var d1;
		var d2;
		var CHART_WIDTH= eChart.scrollWidth;
		//var CHART_HEIGHT= eChart.scrollHeight;
		console.log("+++++ height x width= " + CHART_HEIGHT + " " + CHART_WIDTH);
		// CREATE HEADER
		//
		//	<div class='HEADER'>
		//		<div class='BOX_INFO_RANGE' ><p></p><p></p><p></p></div>
		//		<div class='INFO_BOXES_CONTAINER'>
		//			<div>
		//				<div class='PLOT_INFO'><div><div></div><p></p></div><p>0</p><p>0</p></div>
		//				<div class='PLOT_INFO'><div><div></div><p></p></div><p>0</p><p>0</p></div>
		//				<div class='PLOT_INFO'><div><div></div><p></p></div><p>0</p><p>0</p></div>
		//				<div class='PLOT_INFO'><div><div></div><p></p></div><p>0</p><p>0</p></div>
		//			</div>
		//		</div>
		//	</div>
			d1 = document.createElement("div");
			d1.classList.add("HEADER");
			eChart.appendChild(d1);
			//
			d2 = document.createElement("div");
			d2.classList.add("BOX_INFO_RANGE");
			d1.appendChild(d2);
			d2.appendChild( document.createElement("p"));
			d2.appendChild( document.createElement("p"));
			d2.appendChild( document.createElement("p"));
			//
			d2 = document.createElement("div");
			d2.classList.add("INFO_BOXES_CONTAINER");
			d1.appendChild(d2);
			var d3= document.createElement("div");
			d2.appendChild(d3);
			// class PLOT_INFO
			for(var i=0; i<MAX_PLOTS; i++)
			{
				var dheader = document.createElement("div");
				dheader.classList.add("PLOT_INFO");
				var d4= document.createElement("div");
				dheader.appendChild(d4);
				d4.appendChild(document.createElement("div"));
				d4.appendChild(document.createElement("p"));
				dheader.appendChild(document.createElement("p"));
				dheader.appendChild(document.createElement("p"));
				
				d3.appendChild(dheader);
			}	
			
		// CREATE ZOOM BAR
		// <div class="ZOOM_BAR"><div></div></div>
			d1 = document.createElement("div");		
			eChart.appendChild(d1);  
			d1.classList.add("ZOOM_BAR");
			d2 = document.createElement("div");
			d1.appendChild(d2);
			
		// CREATE CANVAS
		// A set of canvas ovelay
		// the first (lower Z) holds the GRID 
		// the second holds the CURVE
		// the one on the top holds the CURSOR	
		// 	<div class="CANVAS_CONTAINER">
		//		<div class="GRID"><canvas width="1280" height="540"></canvas></div>
		//		<div class="CURSOR"><canvas width="1280" height="540"></canvas></div>
		//		<div class="PLOT"><canvas width="1280" height="540"></canvas></div>
		//		<div class="PLOT"><canvas width="1280" height="540"></canvas></div>
		//		<div class="PLOT"><canvas width="1280" height="540"></canvas></div>
		//		<div class="PLOT"><canvas width="1280" height="540"></canvas></div>
		//	</div>		
			d1 = document.createElement("div");
			eChart.appendChild(d1);  
			d1.classList.add("CANVAS_CONTAINER");
			d1.style.height = CHART_HEIGHT + "px"; 
			// GRID
			d2 = document.createElement("div");
			d1.appendChild(d2); 
			d2.classList.add("GRID");
			var c= document.createElement("canvas");
			d2.appendChild(c);
			c.width = CHART_WIDTH;
			c.height = CHART_HEIGHT;
			// CURSOR
			d2 = document.createElement("div");
			d1.appendChild(d2); 
			d2.classList.add("CURSOR");
			c= document.createElement("canvas");
			d2.appendChild(c);
			c.width = CHART_WIDTH;
			c.height = CHART_HEIGHT;
			//d2.style.zIndex = "9";
			d3= document.createElement("div");
			d3.innerHTML= this;
			d3.style.display= 'none';
			d2.appendChild(d3);
			// PLOT
			for(var i=0; i<MAX_PLOTS; i++)
			{
				d2 = document.createElement("div");
				d1.appendChild(d2); 
				d2.classList.add("PLOT");
				c= document.createElement("canvas");
				c.width = CHART_WIDTH;
				c.height = CHART_HEIGHT;
				d2.appendChild(c);
				//d2.style.zIndex = "1"; 			
			}
		
		// --------------------------------------------------------------------------------------------
		// HTML (DOM) elements
		// --------------------------------------------------------------------------------------------		
		var e= eChart.getElementsByClassName("CANVAS_CONTAINER")[0];
		// grid
		this.ctx_grid= e.getElementsByClassName("GRID")[0].getElementsByTagName("canvas")[0].getContext('2d');
		// cursor
		this.canvas_cursor= e.getElementsByClassName("CURSOR")[0].getElementsByTagName("canvas")[0];
		this.ctx_cursor= this.canvas_cursor.getContext('2d');
		// Curves
		this.curve_e= e.getElementsByClassName("PLOT");
		this.ctx = this.curve_e[0].getElementsByTagName("canvas")[0].getContext('2d');
		
		// Lines are blurred because the canvas virtual size is zoomed to its HTML element actual size. 
		// To overcome this issue we need to adjust canvas virtual size before drawing:
		// Set display size for all canvas elements
		var pxr= 0.5;
		for (var i=0; i<this.curve_e.length; i++)
		{
			var canvas= this.curve_e[i].getElementsByTagName("canvas")[0];
			var w = canvas.parentElement.scrollWidth;
			var h = canvas.parentElement.scrollHeight; 
			//Setting the canvas site and width to be responsive 
			canvas.width = w;
			canvas.height = h;
			canvas.style.width = w;
			canvas.style.height = h;
			var	ctx= canvas.getContext('2d');
			ctx.translate(pxr, pxr);
		}	
		// (w , h) is the one of the first canvas
		this.w= this.canvas_cursor.parentElement.scrollWidth;
		this.h= this.canvas_cursor.parentElement.scrollHeight;
		
		// **Debug
		console.log("PARENT width " + canvas.parentElement.scrollWidth + " / height " + canvas.parentElement.scrollHeight);
		console.log("scrollWidth "  + canvas.scrollWidth + " / scrollHeight " + canvas.scrollHeight);
		console.log("width       "  + w       + " / height       " + h);

		this.header_main= document.getElementById(id).getElementsByClassName("HEADER")[0];
		this.header_e= this.header_main.getElementsByClassName("PLOT_INFO");
		this.header_info_e= this.header_main.getElementsByClassName("BOX_INFO_RANGE");
		
		// --------------------------------------------------------------------------------------------
		// GRID
		// --------------------------------------------------------------------------------------------
		this.Y_STEPS= 8;
		this.X_STEPS= 48;
		// Graph origin (from bottom-left corner)
		// plot area in pixles is (w - grid_X_OFFSET) by (h - grid_Y_OFFSET)
		this.grid_X_OFFSET= 32;
		this.grid_Y_OFFSET= 12;	
		this.GRID_Y= [{min:0, max:0}, {min:0, max:0}];	// Two Y scales: LEFT (grid=0) & RIGHT (grid=1)
		this.GRID_X= {min:0, max:0};
		this.x_axis_is= "time";							// by default X shows time
		this.day_zero= 0;	
		this.GRID_plot= [0, 0]; // curve used for X axis when Grid Added
		this.GRID_zeroaxis= [false, false];
		// Labels
		this.ylabels_LEFT = [];
		this.ylabels_RIGHT = [];
		this.xlabels = [];
		this.YLABELS_RIGHT_OFFSET= 42;
		// ------------------------------------------------------------
		// PLOT DATA
		// ------------------------------------------------------------
		// plot variables
		this.curve_data_1 = [];
		this.curve_data_2 = [];
		this.curve_data_3 = [];
		this.curve_data_4 = [];
		this.curves= [this.curve_data_1, this.curve_data_2, this.curve_data_3, this.curve_data_4 ];
		this.name= ["", "", "", ""];
		this.color= ['#000000', '#000000', '#000000', '#000000'];
		this.grid_Y_axis_curve= [0, 0, 0, 0]; 	// Y axis range used for the curve 
		this.header_enabled= [false, false, false, false];
		this.CURVE_Y= [{min:0, max:0}, {min:0, max:0}, {min:0, max:0}, {min:0, max:0}];	
		this.CURVE_X= [{min:0, max:0}, {min:0, max:0}, {min:0, max:0}, {min:0, max:0}];
		this.CURVE_zeroaxis= [false, false, false, false];
		this.CURVE_fit= [false, false, false, false];
		
		// ----------------------------------------------------
		// **ZOOM
		// ----------------------------------------------------
		this.ZOOM_callback= 0; 	// the ZOOM_callback function gives feedback of zoom in/out by mouse wheel over the grid area
		this.CURSOR_x= 0;		// last cursor's x-coordinate registered by "mousemove"
		this.ZOOM_x= 0;
		this.ZOOM_wheel= 0;
		this.ZOOM_dt_min= 0;
		this.ZOOM_dt_max= 0;
		this.ZOOM_a= 0;
		this.ZOOM_b= 100;
		
		// ------------------------------------------------------------
		// CURSOR
		// Add event listener
		this.canvas_cursor.addEventListener("mousemove", 
			function (e)
			{
				// tell the browser we're handling this event
				e.preventDefault();
				e.stopPropagation();
				// obj is the JAChart object (this)
				var obj= private_var_Chart_Object;
				var rect = obj.canvas_cursor.getBoundingClientRect();
				var x= ~~(e.clientX - rect.left);
				var y= e.clientY - rect.top;
				var grid_X_OFFSET= obj.grid_X_OFFSET;
				var grid_Y_OFFSET= obj.grid_Y_OFFSET;
				// x= is the cursor position within the canvas (no the grid)
				// in case of canvas defined as
				// <canvas id="myChart" width="1280" height="540"></canvas>
				// then x varies from 0 to 1279
				obj.CURSOR_x= x;
				var curve= obj.curves[0];
				var n= curve.length;
			
				var r= obj.GetZoomWindow(0);
				var zoom_len= r.n;
				var curver_i0= r.i;
			
				// Look up position in the curve
				// look within range curver_i0 .. curver_i0+zoom_len
				var i=curver_i0;
				for(var j= 0; j<zoom_len; i++, j++) 
				{
					var xc1= (i<n)      ? curve[i].x   : curve[n-1].x;
					var xc2= ( (i+1)<n )? curve[i+1].x : curve[n-1].x;
					if( xc1 >= x &&  x <= xc2 ) break;
				}

				// found ?
				// i is the position
				if(j < zoom_len)
				{			
					for(var plot_ID= 0; plot_ID < obj.header_enabled.length; plot_ID++)
						if(obj.header_enabled[plot_ID])
						{
							var c= obj.curves[plot_ID];
							var dot= c[i];				
							obj.HeaderInfo(plot_ID, numeriza_long( dot.Y_value ), hexdate2ddmmyy(dot.X_value.day) + " " + ts2hhmmss(dot.X_value.time));
						}
					// Draw cursor 
					// 1.Vertical line
					var ctx= obj.ctx_cursor;
					ctx.clearRect(0, 0, obj.w, obj.h);
					ctx.beginPath();
					ctx.lineWidth = 1;
					ctx.strokeStyle = '#668866';
					ctx.fillStyle = '#ffffff';
					// 2. Circle
					ctx.arc(curve[i].x, curve[i].y, 6, 0, 2 * Math.PI, false);
					ctx.moveTo(curve[i].x, (obj.h - grid_Y_OFFSET)); 
					ctx.lineTo(curve[i].x, 0);
					ctx.stroke();
				}
				else {
					console.log("NO " + x + "," + y );
				}
			}
		, false);
		
		// ------------------------------------------------------------
		// **ZOOM
		this.canvas_cursor.addEventListener("wheel", 
			function (e)
			{
				// tell the browser we're handling this event
				e.preventDefault();
				e.stopPropagation();
				// My stuff
				var obj= private_var_Chart_Object;
				var grid_X_OFFSET= obj.grid_X_OFFSET;
				var grid_Y_OFFSET= obj.grid_Y_OFFSET;
				var f= (obj.ZOOM_b - obj.ZOOM_a); // < 100
				if(f>100 || f<=0) f= 100;
				var pre_ZOOM_wheel= obj.ZOOM_wheel;
				obj.ZOOM_wheel=  (100 / f) - 1;
				
				var prev_ZOOM_factor = obj.ZOOM_wheel;
				if(obj.ZOOM_wheel == 0) obj.ZOOM_x = obj.CURSOR_x;
				
				if(e.deltaY < 0) obj.ZOOM_wheel += 1;
				else if(obj.ZOOM_wheel>0) obj.ZOOM_wheel -= 1;
				else obj.ZOOM_wheel= 0;
				
				if(obj.ZOOM_wheel<0) obj.ZOOM_wheel= 0;
				
				// **ZOOM
				// update?
				console.log("   ZOOM_wheel " + obj.ZOOM_wheel );
				if( pre_ZOOM_wheel != obj.ZOOM_wheel )
				{
					var w_dots=  (obj.w - obj.grid_X_OFFSET);
					var sz_percentage= (obj.ZOOM_b - obj.ZOOM_a);
					obj.ZOOM_x=  obj.grid_X_OFFSET +  w_dots * obj.ZOOM_a / 100 + w_dots * sz_percentage / 100 / 2;
					// zoom spot is centered as spot_x and size is spot_sz
					// spot_x and spot_sz is x100 percentage of canvas size in dots
					// get spot_x as percentage 0.100
					var spot_x= obj.ZOOM_x * 100 / (obj.w - obj.grid_X_OFFSET);
					// get display windows area (dots) as a percentage
					var spot_sz= 100 / ( 1 + obj.ZOOM_wheel);
					var a= spot_x - spot_sz / 2;
					var b= spot_x + spot_sz / 2;
					if(b>100) { b= 100; a= 100 - spot_sz; }
					if(a<0)   { a= 0;   b= spot_sz;       }
							
					console.log("mouse wheel");
					console.log("   w_dots " + w_dots);
					console.log("   obj.ZOOM_x " + obj.ZOOM_x);
					console.log("   zoom factor " + obj.ZOOM_wheel + " a,b = " + ~~a + " / " + ~~b);
					console.log("   spot_sz " + spot_sz);
					
					this.ZOOM_a= a;
					this.ZOOM_b= b;		
					obj.Zoom (a, b);
				}
			}
		, false);
	}

	// ------------------------------------------------------------------------------------------------
	// ------------------------------------------------------------------------------------------------
	// PLOT

	// Input 
	//
	// PLOT data
	// - input data (c_data) is an array of
	//   c_data[]= {date:"2021-02-25 18:50:29.654385", value:"0.052448"};
	// - data is stored as an array of
	//   []= {X_value:{day:d, time:t}, Y_value:<a float number>}
	//   where
	//      X_value is time split into day ("2021-02-25" converted to hexdate) and time ("18:50:29.654385" coverted to seconds)
	//      Y_value= a float value
	// - data retrieved with DataGet() is given as an array
	//   []= {X_value:<time in datetime format>, Y_value:<a float number>}
	Plot(c_data, grid=0) 
	{
		if(this.N_curves >= MAX_PLOTS) return;	// 4 curves max
		var plot_ID= this.N_curves;

		this.name[this.N_curves]= "plot" + plot_ID;
		this.color[this.N_curves]= "#000000";
		// assign a grid
		this.grid_Y_axis_curve[this.N_curves]= grid;
		if(this.N_grids == 0 || (this.N_grids==1 && grid !=0)) this.GridYaxisAssign (plot_ID);

		// (1) PROCESS CURVE
		// Copy values and add grid (x,y)
		// converts strings into numbers
		// "2021-02-25" into an hexdate integer
		// "18:50:29.654385" into seconds
		// "0.052448" into float
		var curve= this.curves[plot_ID];
		for(var i=0; i<c_data.length; i++) 
		{
			var datetime= c_data[i].date.split(" ");
			var d= hexdate(datetime[0]);
			var t= 0;
			var ta="";
			if(datetime.length>=2) ta= datetime[1].split(":");
			if(ta.length === 3) t=  ~~((1*ta[2]) + 1 * 60 * ta[1] + + 1 * 60 * 60 * ta[0]);	
			var v= parseFloat(c_data[i].value);
			if(!isNaN(v)) curve.push({x:0, y:0, X_value:{day:d, time:t}, Y_value:v});
		}
		// (2) calculate X-axis range: dt_min .. dt_max (seconds)
		var dt_max=0;
		var dt_min=0;	
		var first_pending= true;
		var timeinfo= false;
		for(var i=0; i<curve.length; i++)
		{
			var dot= curve[i];
			// day is hexdate, time is seconds
			var dt= dtime(dot.X_value.day, dot.X_value.time);
			if(first_pending)
			{
				first_pending= false;
				dt_max= dt;
				dt_min= dt;
			}			
			if(dt_max < dt) dt_max= dt;
			if(dt_min > dt) dt_min= dt;
			if(dot.X_value.time != 0) timeinfo= true;
		}	
		this.CURVE_X[plot_ID].min= dt_min;
		this.CURVE_X[plot_ID].max= dt_max;
		console.log("### Plot " + name + " " + plot_ID + " dots= " + curve.length + " range= " + dt_min + " .. " + dt_max);
		this.N_curves ++;
		return (this.N_curves - 1);
	}

	PlotClone(plot_ID, grid=-1)
	{
		if(this.N_curves >= MAX_PLOTS) return;	// 4 curves max
		if(plot_ID >= this.N_curves) {
			console.log("--- ERROR PlotClone - wrong plot " + plot_ID);
			return;
		}
		this.name[this.N_curves]= "plot" + this.N_curves;
		this.color[this.N_curves]= "#000000";		
		if(grid<0)
			this.grid_Y_axis_curve[this.N_curves]= this.grid_Y_axis_curve[plot_ID];
		else
			this.grid_Y_axis_curve[this.N_curves]= grid;
		//var grid= this.grid_Y_axis_curve[plot_ID];
		//this.grid_Y_axis_curve[this.N_curves]= grid;
		var curve_src= this.curves[plot_ID];
		var curve_dst= this.curves[this.N_curves];
		for(var i=0; i<curve_src.length; i++)
			curve_dst.push({x:0, y:0, X_value:curve_src[i].X_value, Y_value:curve_src[i].Y_value});
		this.CURVE_X[this.N_curves].min= this.CURVE_X[plot_ID].min;
		this.CURVE_X[this.N_curves].max= this.CURVE_X[plot_ID].max;
		console.log("### PlotClone " + name + " grid= " + this.grid_Y_axis_curve[this.N_curves] + "  origin= " + plot_ID + " to this=" + this.N_curves);
		this.N_curves++;
		return (this.N_curves-1);
	}
	
	Set(plot_ID, name, color) 
	{
		if(plot_ID >= this.N_curves) {
			console.log("--- ERROR Set - wrong plot " + plot_ID);
			return;
		}
		this.name[plot_ID]= name;
		this.color[plot_ID]= color;
	}
	
	
	// this function does 2 things
	// (1) Plot a dot within the canvas area
	//     (x, y) is the PIXEL position refered to the top-left corner
	//     which value ranges from 
	//     x= (0 + grid_X_OFFSET) .. canvas width
	//     y= 0 .. (canvas heigth - grid_Y_OFFSET)
	// (2) draws a straight line from (x,y) to previous dot (x0,y0)
	dotplot(plot_ID, x, y, x0, y0)
	{
		//if( y >= (this.h-this.grid_Y_OFFSET) ) return; // y==0 means a non printable dot
		if(y==0) return;
		// (1) draw a circle at (x,y)
		var ctx= this.curve_e[plot_ID].getElementsByTagName("canvas")[0].getContext('2d');
		var radius= 1.2; //(plot_ID==0) ? 2 : .8;
		ctx.beginPath();
		ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
		ctx.fillStyle = '#ffffff';
		ctx.fill();
		ctx.lineWidth = .5; // (plot_ID==0) ? 1 : .5;
		ctx.strokeStyle = this.color[plot_ID]; //'#00aa00';
		// (2) Draw line from (x0, y0) to (x,y)
		if(!(x0==0 && y0==0)) { ctx.moveTo(x0, y0); ctx.lineTo(x, y); }
		ctx.stroke();
	}

	// Plot one point after the other by calling dotplot() 
	// called from DrawCurve()
	CurvePlot(plot_ID, curve) 
	{
		var r= this.GetZoomWindow(plot_ID);
		var n= r.n;
		var curver_i0= r.i;	
		var X= 0;
		var Y= 0;
		var preX0=0;
		var preY0=0;
		for(var i=0; i<n; i++, curver_i0++)
		{
			var dot= curve[curver_i0];
			X= dot.x;
			Y= dot.y;
			this.dotplot(plot_ID, X, Y, preX0, preY0);
			preX0= X; 
			preY0= Y;
		}
	}

	// Draw Curve
	Draw(plot_ID) 
	{
		if(this.N_grids==0) 
		{ 
			console.log("--- ERROR Draw - You need GridYaxisAssign first to add a curve");
			return;	
		}
		if(plot_ID >= this.N_curves) {
			console.log("--- ERROR Draw - wrong curve " + plot_ID);
			return;
		}
		var curve= this.curves[plot_ID];
		var g= this.grid_Y_axis_curve[plot_ID];
		
		var gridowner= (plot_ID == this.GRID_plot[g])? "YES" : "NO";
		
		console.log("### Draw plot_ID= " + plot_ID + " " + gridowner + " / g= " + g + " / GRID_Y=" + this.GRID_Y[g].min + " .. " + this.GRID_Y[g].max );
		
		// [1] COMPUTE XY coordinates 
		// assign (x,y) coordinates (pixel position within the grid) 
		// to the visible dots of the curve considering the zoom factor
		var w= this.w;
		var h= this.h;
		var grid_X_OFFSET= this.grid_X_OFFSET;
		var grid_Y_OFFSET= this.grid_Y_OFFSET;
		
		var r= this.GetZoomWindow(plot_ID);
		var n= r.n;
		var curver_i0= r.i;		
		
		// ZOOM range
		// Curve dots are curver_i0 .. curver_i0 + n
		// draw from X0 to X1
		var dt0= dtime(curve[curver_i0].X_value.day, curve[curver_i0].X_value.time);
		var X0= (((w - grid_X_OFFSET) * (dt0 - this.GRID_X.min)) / (this.GRID_X.max - this.GRID_X.min));
		var dt1= dtime(curve[curver_i0 + n - 1].X_value.day, curve[curver_i0 + n -1].X_value.time);
		var X1= (((w - grid_X_OFFSET) * (dt1 - this.GRID_X.min)) / (this.GRID_X.max - this.GRID_X.min));	
		
		
		// FIT
		var f= 1;
		var fp= 1;
		var fm= 1;
		var y_max= curve[curver_i0].Y_value;
		var y_min= curve[curver_i0].Y_value;
		if(this.CURVE_fit[plot_ID])
		{
			// then normalize curve
			curver_i0= r.i;	
			for(var i=0; i<n; i++, curver_i0++)
			{
				var Y_value= curve[curver_i0].Y_value;
				if(Y_value < y_min) y_min= Y_value;
				if(Y_value > y_max) y_max= Y_value;
			}
			fp=  (y_max > this.GRID_Y[g].max)? (this.GRID_Y[g].max / y_max) : 1;
			fm=  (y_min < this.GRID_Y[g].min)? (this.GRID_Y[g].min / y_min) : 1;
			console.log("### FIT plot_ID= " + plot_ID + " " + y_min + " .. " + y_max );
			console.log("              " + fm + " .. " + fp );
			f= (fp<fm)? fp : fm;
		}
		
		// Compute (x,y) coordinates
		var X= 0;
		var Y= 0;
		var dot;	
		curver_i0= r.i;
		for(var i=0; i<n; i++, curver_i0++)
		{
			dot= curve[curver_i0];
			var dt= dtime(dot.X_value.day, dot.X_value.time);
			X= (((w - grid_X_OFFSET) * (dt- this.GRID_X.min)) / (this.GRID_X.max - this.GRID_X.min));
			//f= (dot.Y_value>=0)? fp : fm;
			Y=  (h - grid_Y_OFFSET) -  ((f * dot.Y_value)  - this.GRID_Y[g].min) / (this.GRID_Y[g].max - this.GRID_Y[g].min) * (h - grid_Y_OFFSET);
			// Apply ZOOM range, change from curver_i0 .. curver_i0 + n  / to  0..w
			X =  (w - grid_X_OFFSET) * (X - X0) / (X1 - X0) + grid_X_OFFSET;
			dot.x= Math.round(X);
			dot.y= Y;
		}
		// Plot
		var ctx= this.curve_e[plot_ID].getElementsByTagName("canvas")[0].getContext('2d');
		this.Clear(ctx);
		this.CurvePlot (plot_ID, curve);
		// Show curve information on header
		if(this.header_enabled[plot_ID])
		{
			var dot= curve[r.i + r.n -1];
			this.HeaderInfo(plot_ID, numeriza_long( dot.Y_value ), hexdate2ddmmyy(dot.X_value.day) + " " + ts2hhmmss(dot.X_value.time));
		}
		
		// Curve specific configuration
		if(this.CURVE_zeroaxis[plot_ID]) this.CurveZeroAxisDraw(plot_ID, fp, fm);
	}
	
	CurveZeroAxisDraw(plot_ID,fp, fm) 
	{
		if(this.N_grids==0) 
		{ 
			console.log("--- ERROR - You need GridYaxisAssign first to add a grid");
			return;	
		}
		
		if(plot_ID> this.N_curves) return;
		var g= this.grid_Y_axis_curve[plot_ID];
		var curve= this.curves[plot_ID];		

		var r= this.GetZoomWindow(plot_ID);
		var n= r.n;
		var curver_i= r.i;
		
		var y_max= curve[curver_i].Y_value;
		var y_min= y_max;
		for(var i=0; i<n; i++, curver_i++)
		{
			var dot= curve[curver_i];
			var yf= dot.Y_value;
			if(y_max<yf) y_max= yf;
			if(y_min>yf) y_min= yf;
		}
		
		var yminabs= y_min<0 ? -1 * y_min : y_min;
		//var yzero= (this.h - this.grid_Y_OFFSET) * ( f * y_max ) / (y_max + yminabs);
		
		var yzero= (this.h - this.grid_Y_OFFSET) * ( fp * y_max ) / (fp * y_max + fm * yminabs);
		
		console.log("$$$$$$ yzero " + yzero);
		
		var pxr= 0.5;
		var ctx= this.curve_e[plot_ID].getElementsByTagName("canvas")[0].getContext('2d');
		ctx.beginPath();
		ctx.moveTo(this.grid_X_OFFSET - pxr,   yzero);
		ctx.lineTo(this.w - pxr, yzero);
		ctx.strokeStyle = this.color[plot_ID]; //'#00aa00';
		ctx.lineWidth = 0.5;
		ctx.stroke(); 	
	}
	
	CurveZeroAxisEnable (plot_ID) 
	{
		if(plot_ID> this.N_curves) { console.log("--- ERROR - You need a valid curve"); return; }
		this.CURVE_zeroaxis[plot_ID]=true;
	}	
	CurveSetFit (plot_ID) 
	{
		if(plot_ID> this.N_curves) { console.log("--- ERROR - You need a valid curve"); return; }
		this.CURVE_fit[plot_ID]=true;
	}
	// Get curve data as an array
	//   []= {X_value:<time in seconds>, Y_value:<a float number>}
	DataGet(plot_ID, curve_dst) 
	{
		if(plot_ID >= this.N_curves) return;
		var curve_src= this.curves[plot_ID];
		var n= curve_src.length;
		for(var i=0; i<n; i++) 
		{
			var dot= curve_src[i];
			var dt= dtime(dot.X_value.day, dot.X_value.time);
			curve_dst.push({X_value:dt, Y_value:curve_src[i].Y_value});
		}
	}
	// Update Y_value
	DataUpdate(plot_ID, curve_src) 
	{
		if(plot_ID >= this.N_curves) return;
		var curve= this.curves[plot_ID];
		console.log("DataUpdate " + plot_ID + " len= " + curve_src.length);
		// Process data
		var min= (curve_src.length < curve.length)? curve_src.length : curve.length;
		for(var i=0; i<min; i++) 
			curve[i].Y_value= curve_src[i].Y_value;
	}
	// clear canvas by context
	Clear(ctx) 
	{
		ctx.clearRect(0, 0, this.w, this.h);
	}
	// display/hide canvas
	CurveShow(plot_ID, show) 
	{
		if(plot_ID >= this.N_curves) return;
		this.curve_e[plot_ID].style.display= show? 'block' : 'none';
	}
	// Draws a red border around the canvas perimeter
	// For testing
	myChart_draw_test_border(ctx) 
	{
		//ctx.beginPath();
		ctx.strokeStyle = '#ff0000';
		ctx.lineWidth = 1.0;
		ctx.moveTo(0, 0); ctx.lineTo(w, 0);
		ctx.moveTo(w, 0); ctx.lineTo(w, h);
		ctx.moveTo(w, h); ctx.lineTo(0, h);
		ctx.moveTo(0, h); ctx.lineTo(0, 0);
		ctx.stroke(); 
	}
	
	// ------------------------------------------------------------------------------------------------
	// ------------------------------------------------------------------------------------------------
	// **HEADER
	HeaderEnable(plot_ID, enable=true) 
	{
		if(plot_ID >= this.N_curves) return;
		this.header_main.style.display= 'block';
		var e= this.header_e[plot_ID];
		if(e)
		{
			this.header_enabled[plot_ID]= enable? true : false;
			this.header_e[plot_ID].style.display= 'inline';
			var count= 0;
			for(var i=0; i<this.header_enabled.length; i++) if(this.header_enabled[i]) count ++;
		
			if(count) e.parentElement.style.width= (e.offsetWidth * count) + "px";
			if(this.header_enabled[plot_ID])
			{
				// <div>
				//   <div>
				//   <p>
				e.getElementsByTagName("div")[1].style.backgroundColor = this.color[plot_ID];
				e.getElementsByTagName("p")[0].innerHTML= this.name[plot_ID]; 
			}
		}
		else
			this.header_enabled[plot_ID]= false;
	}

	HeaderInfo(plot_ID, value, date) 
	{
		if(plot_ID >= this.N_curves) return;
		if(this.header_enabled[plot_ID] == false) return;
		var e= this.header_e[plot_ID];
		if(e)
		{
			var p= e.getElementsByTagName("p");
			if(p && p.length>=3)
			{
				p[1].innerHTML= value; 
				p[2].innerHTML= date; 
			}
		}
	}

	// ------------------------------------------------------------------------------------------------
	// ------------------------------------------------------------------------------------------------
	// GRID
	
	// GridYaxisAssign() sets the curve to be ussed for the Y axis
	// first time call sets the curve for the LEFT side Y-axis
	// second time call sets the RIGHT side Y-axis
	// returns
	// 0 - LEFT side Y-axis
	// 1 - RIGHT side Y-axis
	GridYaxisAssign (plot_ID) 
	{
		var g= this.N_grids;
		if(this.N_grids>=2) return;		// two grids max: LEFT & RIGHT
		if(plot_ID> this.N_curves) 
		{
			console.log("ERROR GridYaxisAssign - You need Plot first to add a curve");
			return;	// needs a curve
		}
		//var curve= this.curves[plot_ID];
		this.GRID_plot[g]= plot_ID;
		this.N_grids ++;
		console.log("GridYaxisAssign this.N_grids " + this.N_grids + " " + plot_ID);
		return this.N_grids;	
	}
	
	GridCompute()
	{
		if(this.N_grids==0) 
		{ 
			console.log("--- WARNING GridCompute() - No call to GridYaxisAssign to add plot reference");
			// by defualt assign Y axis to the first plot
			if(this.N_curves <=0) return;
			this.GridYaxisAssign(0);
		}

		// ------------------------------------------------------------
		// Y axis
		// ------------------------------------------------------------
		// LEFT side Y axis
		if(this.N_grids >=1) this.Grid_compute_Y_axis(0);
		// RIGHT side Y axis
		if(this.N_grids >=2) this.Grid_compute_Y_axis(1);
		
		// ------------------------------------------------------------
		// X axis
		// ------------------------------------------------------------
		this.Grid_compute_X_axis();
	}
	
	// Grid draw
	// Calculate X ranges for the Grid
	GridDraw () 
	{
		if(this.xlabels.length === 0)
		{
			console.log("--- WARNING GridDraw() - Computing grid");
			this.GridCompute();
		}
/*
		// ------------------------------------------------------------
		// Y axis
		// ------------------------------------------------------------
		// LEFT side Y axis
		if(this.N_grids >=1) this.Grid_compute_Y_axis(0);
		// RIGHT side Y axis
		if(this.N_grids >=2) this.Grid_compute_Y_axis(1);
		
		// ------------------------------------------------------------
		// X axis
		// ------------------------------------------------------------
		this.Grid_compute_X_axis();
		*/
//		this.GridAxis();
		
		// clear frame
		var ctx= this.ctx_grid
		var w= this.w;
		var h= this.h;
		ctx.clearRect(0, 0, this.w, this.h);
		
		var pxr= 0.5;
		var grid_X_OFFSET= this.grid_X_OFFSET;
		var grid_Y_OFFSET= this.grid_Y_OFFSET;
		
		ctx.beginPath();
		// Grid
		// X - axis
		ctx.moveTo(grid_X_OFFSET, h - grid_Y_OFFSET - pxr); ctx.lineTo(grid_X_OFFSET + w, h - grid_Y_OFFSET - pxr);
		// Y - axis
		ctx.moveTo(grid_X_OFFSET, 0); ctx.lineTo(grid_X_OFFSET, h - grid_Y_OFFSET - pxr);
		ctx.strokeStyle = '#000000';
		ctx.lineWidth = .5;
		ctx.stroke(); 
		
		// Y-axis (horizontal lines) - from left to right
		var y_step_size= (h - grid_Y_OFFSET - pxr) / this.Y_STEPS;
		for(var i=1; i<this.Y_STEPS; i++) { 
			ctx.moveTo(grid_X_OFFSET - pxr, (h - grid_Y_OFFSET) - y_step_size * i - pxr); 
			ctx.lineTo(w - pxr, (h - grid_Y_OFFSET) - y_step_size * i - pxr); 	
		}
		ctx.moveTo(grid_X_OFFSET - pxr, 0); ctx.lineTo(w - pxr, 0); 

		// X-axis (Vertical lines) - from up to down
		var x_step_size= (w - grid_X_OFFSET - pxr) / this.X_STEPS;
		for(var i=1; i<this.X_STEPS; i++) 
			{ ctx.moveTo(grid_X_OFFSET + x_step_size * i - pxr, h - grid_Y_OFFSET - pxr); ctx.lineTo(grid_X_OFFSET + x_step_size * i - pxr, 0); }
		ctx.moveTo(w - pxr, h - grid_Y_OFFSET - pxr); ctx.lineTo(w - pxr, 0);
		ctx.strokeStyle = '#000000';
		ctx.lineWidth = .1;
		ctx.stroke(); 
		
		// --------------------------------------------------------------------------------------------
		// LABELS
		ctx.textAlign = "left";
		ctx.fillStyle = "#000000"
		var text_hight= 8;
		
		// X labels
		var steps= this.xlabels.length;
		ctx.font = "normal 10px Arial";
		// draw every second label
		var x_offset= 10;
		var label_Y_OFFSET= (grid_Y_OFFSET < x_offset) ? x_offset : grid_Y_OFFSET;
		for(var i= 0; i<steps-1; i+=2) 
			ctx.fillText(this.xlabels[i], grid_X_OFFSET + x_step_size * i + x_offset , (h - label_Y_OFFSET) + text_hight);
		
		// Y labels
		ctx.font = "normal 10px Arial";
		var ysteps= this.ylabels_LEFT.length;
		for(var i=1; i<ysteps; i++) 
			ctx.fillText( this.ylabels_LEFT[i-1], 0, (h - grid_Y_OFFSET) - y_step_size * i + text_hight/2); 	
		ctx.fillText(this.ylabels_LEFT[ysteps - 1], 0, text_hight);
		
		if(this.N_grids>1) 
		{
			var right_offset= this.YLABELS_RIGHT_OFFSET;
			var ysteps= this.ylabels_RIGHT.length;
			for(var i=1; i<ysteps; i++) 
				ctx.fillText( this.ylabels_RIGHT[i-1], w - right_offset, (h - grid_Y_OFFSET) - y_step_size * i + text_hight/2); 	
			ctx.fillText(this.ylabels_RIGHT[ysteps - 1], w - right_offset, text_hight);
		}
	}


	// input is grid side
	// 0 - LEFT
	// 1 - RIGHT (second grid)
	Grid_compute_Y_axis(g)
	{
		if(g != 0 && g != 1)
		{ 
			console.log("--- ERROR Grid_compute_Y_axis() - wrong Y axis= " + g);
			return;
		}
		var plot_ID= this.GRID_plot[g];
		if(plot_ID> this.N_curves) return;
		var curve= this.curves[plot_ID];		

		var r= this.GetZoomWindow(plot_ID);
		var n= r.n;
		var curver_i= r.i;
		
		var y_max= curve[curver_i].Y_value;
		var y_min= curve[curver_i].Y_value;
		for(var i=0; i<n; i++, curver_i++)
		{
			var dot= curve[curver_i];
			if(y_max<dot.Y_value) y_max= dot.Y_value;
			if(y_min>dot.Y_value) y_min= dot.Y_value;
		}
		if(y_max == y_min)
		{
			y_min= 0;
			y_max= 2 * y_max;
		}

		// % uplift
		var dec= ("" + y_max).split(".");
		var ndec= (dec.length==2)?dec[1].length : 0;
		y_max= parseFloat((1.0020 * y_max).toFixed(ndec));		
		dec= ("" + y_min).split(".");
		ndec= (dec.length==2)?dec[1].length : 0;
		y_min= parseFloat(( (1.0 - 0.0020) * y_min).toFixed(ndec));
		console.log("---Grid_compute_Y_axis " + g +"  plot_ID= " + plot_ID + "  " + y_min + " .. " + y_max);
		this.GRID_Y[g].max= y_max;
		this.GRID_Y[g].min= y_min;		
		// ----------------------------------------------------
		// LABELS (Y axis)
		// ----------------------------------------------------
		var labels= []; 
		var n= this.Y_STEPS;
		var v_step= (y_max - y_min)  / n;
		for(var i=1; i<n; i++) 	
			labels.push( numeriza( (y_min + (v_step * i) ) )  );		
		labels.push( numeriza((y_max)) );	
		if(g==0) this.ylabels_LEFT= labels;
		else this.ylabels_RIGHT= labels;		
	}

	// Grid_compute_X_axis
	// Compute X axis information
	// - X labels
	// - this.GRID_X range (max, min)
	// CALLED FROM:
	// - plot and always before GridDraw. GridDraw needs the X axis information
	// 
	Grid_compute_X_axis() 
	{
		var plot_ID= this.GRID_plot[0];
		if(plot_ID> this.N_curves) return;
		var curve= this.curves[plot_ID];
			
		var dt_max=0;
		var dt_min=0;	
		var first_pending= true;
		var timeinfo= false;

		var r= this.GetZoomWindow(plot_ID);
		var n= r.n;
		var curver_i= r.i;		
		
		console.log("Grid_compute_X_axis (" + n + ") " + curver_i + " .. " + ~~(curver_i+n));
		
		// (1) calculate X-axis range: dt_min .. dt_max (seconds)
		for(var i=0; i<n; i++, curver_i++)
		{
			var dot= curve[curver_i];
			// day is hexdate
			// time is seconds
			var dt= dtime(dot.X_value.day, dot.X_value.time);
			if(first_pending)
			{
				first_pending= false;
				dt_max= dt;
				dt_min= dt;
			}			
			if(dt_max < dt) dt_max= dt;
			if(dt_min > dt) dt_min= dt;
			if(dot.X_value.time != 0) timeinfo= true;
		}
		// Units
		this.x_axis_is= "time";										// default X shows time, except
		if(!timeinfo) this.x_axis_is= "date"; 						// ... no time provided, only date
		if((dtdays(dt_max - dt_min)) >2) this.x_axis_is= "date"; 	// ... more than 2 days	
		if( (dt_max - dt_min) < 30) this.x_axis_is= "seconds"; 		// ... less than 30 seconds	

		// (2) calculate GRID LABELS (X axis)
		this.xlabels= [];
		// X shows date dd-mm-yy
		if(this.x_axis_is == "date")
		{
			var step_secs= ~~((dt_max - dt_min) / this.X_STEPS);
			for(var i=1; i<this.X_STEPS; i++) 	
			{
				this.xlabels.push( dt2ddmmyy( dt_min + (step_secs * i) ) );	
			}
			this.xlabels.push(dt2ddmmyy(dt_max));	
		}
		// X shows date mm:ss
		else if(this.x_axis_is == "seconds")
		{
			var step_secs= ((dt_max - dt_min) / this.X_STEPS);
			for(var i=1; i<this.X_STEPS; i++) 	
			{
				this.xlabels.push( dt2mmss( dt_min + (step_secs * i) ) );	
			}
			this.xlabels.push(dt2mmss(dt_max));	
		}
		// X shows date hh:mm
		else
		{
			var step_secs= ~~((dt_max - dt_min) / this.X_STEPS);
			for(var i=1; i<this.X_STEPS; i++) 	
			{
				this.xlabels.push( dt2hhmm( dt_min + (step_secs * i) ) );	
			}
			this.xlabels.push(dt2hhmm(dt_max));	
		}

		this.GRID_X.max= dt_max;
		this.GRID_X.min= dt_min;
		// ** debug
		console.log("X range = " +  this.GRID_X.min + " .. " + this.GRID_X.max);
		//console.log(this.xlabels);
		var range="";
		if(this.x_axis_is == "date") range= "" + dtdays(dt_max - dt_min) + " days";
		else if(this.x_axis_is == "seconds") range= "x= mm:ss";
		else range= ""  + "x= hh:mm (" + (dtdays(dt_max - dt_min) +1) + " days)";
		
		if(this.header_info_e.length)
		{
			var p= this.header_info_e[0].getElementsByTagName("p");
			if(p.length>=1) p[0].innerHTML= range + " / " + n + " dots";
			if(p.length>=2) p[1].innerHTML= "" + dt2ddmmyy(dt_min) + " " + dt2hhmmss(dt_min); 
			if(p.length>=3) p[2].innerHTML= "" + dt2ddmmyy(dt_max) + " " + dt2hhmmss(dt_max); 
		}

		return {min:dt_min, max:dt_max};
	}
	

	// ------------------------------------------------------------------------------------------------
	// ------------------------------------------------------------------------------------------------
	// **ZOOM
	//
	// set callback
	ZoomSetCallback(zoomcallback=0) 
	{
		this.ZOOM_callback= zoomcallback;
	}
	// Return ZOOM window
	// i= index of curce first dot 
	// n = items of the curve
	GetZoomWindow (plot_ID) 
	{
		var curve= this.curves[plot_ID];
		var curver_i0=0;
		var zoom_n= curve.length;
		// Zoom is set?
		if(this.ZOOM_dt_min !=0)
		{
			var n= curve.length;
			var i=0;
			for(; i<n; i++)
			{
				var dot= curve[i];
				var dt= dtime(dot.X_value.day, dot.X_value.time);
				if(dt>=this.ZOOM_dt_min) break;
			}
			// found
			if(i<n)
			{
				curver_i0= i;
				for(; i<n; i++)
				{
					var dot= curve[i];
					var dt= dtime(dot.X_value.day, dot.X_value.time);
					if(dt>this.ZOOM_dt_max) break;
				}
				zoom_n= i - curver_i0;
			}
			// not found
			else { }
		}
		//console.log(" ----------- i= " + curver_i0 + " n= " + zoom_n + " curve.length= " + curve.length + " / " +(curver_i0 + zoom_n));
		return {i:curver_i0, n: zoom_n};
	}

	// Set Zoom to last ndays
	ZoomLastNDays (n_days=1) 
	{
		if(this.N_grids<=0) return;
		var plot_ID= this.GRID_plot[0];
		if(plot_ID> this.N_curves) return;
		console.log("Zoom "+ n_days);
		var dt_min= this.CURVE_X[plot_ID].min;
		var dt_max= this.CURVE_X[plot_ID].max;
		var dt= n_days * 24 * 60 * 60;
		if( (dt_max - dt_min) < dt) 
		{
			console.log("WRN: nothing to zoom");
			return -1;
		}
		
		var a= ((dt_max - dt_min) - dt) * 100 / (dt_max - dt_min);
		this.Zoom(a, 100);
		return 0;
	}

	// Called form ControlBar to zoom chart
	// a= 0..100 as % from left side (x=0 .. width)
	// b= 0..100 as % from left side (x=0 .. width)
	Zoom (a, b) 
	{
		var plot_ID= 0;
		var dt_min= this.CURVE_X[plot_ID].min;
		var dt_max= this.CURVE_X[plot_ID].max;
		console.log("Zoom a,b= " + ~~a + " " + ~~b);
		if( a>= b ) 
		{
			console.log("WRN: nothing to zoom");
			return;
		}
		
		this.ZOOM_dt_min= dt_min + (dt_max - dt_min) * a / 100;
		this.ZOOM_dt_max= dt_min + (dt_max - dt_min) * b / 100;
		
		this.ZOOM_a= a;
		this.ZOOM_b= b;	
		// Grid
		this.GridCompute();
		this.GridDraw();
		this.Clear(this.ctx_cursor);
		
		// Curve 
		for(var i=0; i<this.N_curves; i++)
		{
			this.Clear(this.curve_e[i].getElementsByTagName("canvas")[0].getContext('2d'));
			this.Draw(i);			
		}
		// Callback
		if(this.ZOOM_callback) this.ZOOM_callback(a , b);
	}
} // (END) class





// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
function numeriza(num)
{
	var f= 1;
	var n= 0;
	// small number: 3, 6 o 9 decimals
	if( num < 1.0)
	{
		for(; num!=0.0 && (num *f)<1000.0 && n<3; f= f * 1000, n++);	
		return (num).toFixed( 3*n );	
	}
	// for large numbers use Units: k-kilo M-Mega B-Billion
	else
	{
		var u="";
		for(; (num *f)>10000 && n<3; f= f * 0.001, n++);
		if(n==1) u="k";
		else if(n==2) u="M";
		else if(n==3) u="B";
		return (num *f).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')+" "+u;
	}
}

function numeriza_long(num)
{
	if( num < 1.0) 			return numeriza(num);
	// less than 10 then 3 decimal digits
	else if( num < 10.0)	return (num).toFixed(3).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
	// 2 deciaml digits
	else           			return (num).toFixed(2).replace('.', ',').replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
}

// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
// Date time extended formart
// HEXDATE - is a date representation consisting on a 3-octects value [2]=year [1]=month [0]=day
//
// hexdate library works with a 3-octects value [2]=year [1]=month [0]=day
// Convert date string yyyy-mm-dd
// to hexdate
function hexdate(str)
{
	var di= str.split("-");
	if(di.length!=3) return 0;
	return  (parseInt(di[0].substr(2)) << 16) | ( parseInt(di[1]) <<8 ) | parseInt(di[2]);
}
// convert hexdate to date string
// dd-mm-yy
function hexdate2ddmmyy(hd)
{
	var y=  (hd >> 16);
	var m=  ((hd - (y << 16)) >>  8);
	var d= ((hd - (y << 16)) - (m << 8));
	return  ""+ ((d<=9)?"0":"") + d + "-" + ((m<=9)?"0":"") + m + "-" + ((y<=9)?"0":"") + y;
}
function hexdate2yyyymmdd(hd)
{
	var y= (hd >> 16);
	var m= ((hd - (y << 16)) >>  8);
	var d= ((hd - (y << 16)) - (m << 8));
	return  "20"+ ((y<=9)?"0":"") + y + "-" +	
			((m<=9)?"0":"") + m + "-" + 
			((d<=9)?"0":"") + d;
}

// ts - (seconds) is a time hh:mm:ss in seconds (no day info)
// time in seconds to string hh:mm:ss
// t = is a time in seconds
// return hh:mm:ss
function ts2hhmmss(t) 
{
//	var t=  ~~((1*ta[2]) + 1 * 60 * ta[1] + + 1 * 60 * 60 * ta[2]);
	// t = is a time in seconds
	var h= Math.trunc(t / 60 / 60);
	var m= Math.trunc( (t  - h  * 60 * 60) / 60);
	var s= Math.trunc(t - h * 60 * 60 - m * 60);
	return "" + ((h<=9)?"0":"") + h + ":" + ((m<=9)?"0":"") + m + ":" + ((s<=9)?"0":"") + s;
}
// DateTime (seconds)
// is a numerical form of a date/time originally entered as "yyyy-mm-dd hh:mm:ss.s" that is converted to
// day * 24 *60 * 60 + time (seconds)
// is COMPARABLE and SUMMABLE
// Date+Time is a date in seconds
// hd is hexdate
// ts is seconds
function dtime(hd, ts)
{
	var da= hexdate2yyyymmdd(hd).split("-");
	var date = new Date(da[0], da[1]-1, da[2]);
	return Math.trunc(date.getTime() / 1000 + ts);
}

function dt2ddmmyy(dt)
{
	var date = new Date();
	date.setTime(dt * 1000);
	var y= ("" + date.getFullYear()).substr(2);
	var m= date.getMonth() + 1;
	var d= date.getDate();
	return  ""+ ((d<=9)?"0":"") + d + "-" + ((m<=9)?"0":"") + m + "-" + y;
}
function dt2hhmm(dt)
{
	var date = new Date();
	date.setTime(dt * 1000);
	var h= date.getHours();
	var m= date.getMinutes();
	return  ""+ ((h<=9)?"0":"") + h + ";" + ((m<=9)?"0":"") + m;
}
function dt2mmss(dt)
{
	var date = new Date();
	date.setTime(dt * 1000);
	var m= date.getMinutes();
	var s= date.getSeconds();
	return  ""+ ((m<=9)?"0":"") + m + ":" + ((s<=9)?"0":"") + s;
}
function dt2hhmmss(dt)
{
	var date = new Date();
	date.setTime(dt * 1000);
	var h= date.getHours();
	var m= date.getMinutes();
	var s= date.getSeconds();
	return  ""+ ((h<=9)?"0":"") + h + ":" + ((m<=9)?"0":"") + m + ":" + ((s<=9)?"0":"") + s;
}
function dtdays(dt)
{
	return Math.trunc(dt / 60 / 60 / 24);
}


// converts from datetime (dt) to (hexdate, ts)
// dt is a date in seconds
function dtime2hdts(dt)
{
	var date = new Date();
	date.setTime(dt * 1000);
	var y= ("" + date.getFullYear());
	var m= date.getMonth() + 1;
	var d= date.getDate();
	// yyyy-mm-dd
	var str= "" + y  +  "-" + ((m<=9)?"0":"") + m + "-" + ((d<=9)?"0":"") + d;
	var hd= hexdate(str);
	
	var h= date.getHours();
	var m= date.getMinutes();
	var s= date.getSeconds();
	var ts= 60 * 60 * h + 60 * m + s;
	return ({d:hd, t:ts});
}



// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------
// CLASS - ZOOM BAR
//

// Object global variable
var private_var_ZoomBar_Object;
// Class
class ZoomBar {
	constructor(ChartObj=null) 
	{
		private_var_ZoomBar_Object= this;
		this.rail= document.getElementsByClassName("ZOOM_BAR")[0];
		this.rail.style.display= 'block';
		this.pad= this.rail.getElementsByTagName('div')[0];
		//this.pad.style.display= 'block';
		this.rail_width= this.rail.clientWidth;
		this.pillado= false;
		this.callback= (ChartObj == null) ? 0 : (function (a, b) { ChartObj.Zoom(a, b); });
//		if(ChartObj)
//			this.callback = (function (a, b) { ChartObj.Zoom(a, b); });
		this.x= 0;
		this.x_prev= 0;
		this.pad_pos= 0; // pad's margin left
		this.Zoom (0, 100);
		// ----------------------------------------			
		// RAIL
		this.rail.onmousemove= function(ev) { 	
			var zobj= private_var_ZoomBar_Object;
			var rail= zobj.rail;
			var rect= rail.getBoundingClientRect();
			var xa= Math.floor( ( ev.clientX - rect.left ) / ( rect.right - rect.left ) * rail.clientWidth );
			var ya= Math.floor( ( ev.clientY - rect.top ) / ( rect.bottom - rect.top ) * rail.clientHeight );
			zobj.x= xa;
			if(zobj.pillado) zobj.movepad();
			zobj.x_prev= zobj.x;
		}
		this.rail.onmouseleave= function(ev) { 
			var zobj= private_var_ZoomBar_Object;
			//console.log("onmouseleave");
			if(zobj.pillado) {
				zobj.movepad();
				zobj.pillado= false;
				zobj.pad.classList.remove("pressed");
				zobj.updateview();
			}
		}
		this.rail.onmousedown= function(ev) { 
			var zobj= private_var_ZoomBar_Object;
			//console.log("rail.onmousedown ");
			zobj.movepad();
		}
		this.rail.onmouseup= function(ev) { 
			var zobj= private_var_ZoomBar_Object;
			//console.log("rail.onmouseup");
			zobj.updateview();
		}		
		// ----------------------------------------			
		// PAD
		this.pad.onmousedown= function(ev) { 
			var zobj= private_var_ZoomBar_Object;
			//console.log("pad.onmousedown");
			zobj.pillado= true;
			zobj.pad.classList.add("pressed");
		}
		this.pad.onmouseup= function(ev) { 
			var zobj= private_var_ZoomBar_Object;
			//console.log("onmouseup");
			zobj.pillado= false;
			zobj.pad.classList.remove("pressed");
		}
	}
	// END constructor
	
	movepad()
	{
		//console.log("movepad " + this.x);
		var pad_width= this.pad.clientWidth;
		var x_max= this.rail_width;
		var p= 0;
		var x= this.x;
		var d= this.x - this.x_prev;
		// pressed ...
		// within the pad
		if( x>=this.pad_pos && x < (this.pad_pos + pad_width))
		{
			//console.log("----------------movepad d= " + d );
			var new_p= this.pad_pos + d;
			if( new_p < 0) p= 0;
			else if ((new_p + pad_width ) > x_max) p= x_max - pad_width;
			else p= new_p;
		}
		// outside the pad
		else
		{
			if( x < pad_width/2) p= 0;
			else if ((x + pad_width/2 ) > x_max) p= x_max - pad_width;
			else p= x - pad_width/2;
		}
		this.pad_pos= p;
		this.pad.style.marginLeft= p + "px";
	}
	Zoom (a, b)
	{
		this.pad_pos= ~~(this.rail_width * a /100);
		this.pad.style.marginLeft= ~~(this.rail_width * a /100) + "px";
		this.pad.style.width = ~~(this.rail_width * (b-a) /100) + "px";
	}
	// pad has moved across the rail and need to
	// compute a,b and call Chart to update zoom view
	updateview()
	{
		var w= this.rail_width;
		var m= this.pad_pos;
		var a= Math.round( 10 *(m * 100 / w)) / 10;
		var b=  Math.round( 10 * ((m + this.pad.clientWidth) * 100 / w)) / 10;
		if(this.callback) this.callback(a, b);
	}
} // (END) Class ZoomBar




!function ()
{
	console.log("2021 (Fernando.R) - Just Another JAvascript chart library - version " + JA2Chart_version);
	console.log("----------------------------------------");
}();
// END OF FILE