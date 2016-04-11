var ngAppControllers = angular.module('ngAppControllers', []);

ngAppControllers.controller('networkController', ['$scope','$http','$routeParams', function ($scope, $http, $routeParams) {

	$scope.hover_message = "";
	$scope.top_n_val = "";
	$scope.search_player = "";
	$scope.server_returner = "";

	d3.xml("./static/img/network.svg", "image/svg+xml", function(error, xml) {
		if (error) throw error;
		document.getElementById('network-container').appendChild(xml.documentElement);
		$scope.net = d3.select('#tennis_network');
		$('select').material_select();
		$scope.net.selectAll('path').transition().duration(500).style('stroke-width',0).style('stroke-opacity',1);
		$scope.net.style('opacity',0);
		//$scope.svg_loaded('Rafael Nadal');
	});

	$scope.svg_loaded = function(player) {

		$scope.net.transition().duration(250).style('opacity',1);
		$scope.net.selectAll('path').transition().duration(500).style('stroke-width',0).style('stroke-opacity',1);
			$http({
				method: 'GET',
				url: 'https://dev16788.service-now.com/api/8380/tennis_iq/'+$scope.server_returner+'/'+player
			}).then(function successCallback(response) {
				$scope.player_data = response.data.result;
				console.log($scope.player_data);
				$scope.update_network();
			}, function errorCallback(response) {
				console.log(response);
			});
	};

	$scope.update_network = function() {
		var this_dataset = $scope.player_data['top_'+$scope.top_n_val];
		for (var i = 0; i<this_dataset.length; i++) {
			var this_score = this_dataset[i]
			var this_width;
			var this_ret_width;
			//if ($scope.server_returner=='server') {
				this_width = this_score.prob_win;
				this_ret_width = 1-this_score.prob_win;
			/*} else {
				this_width = 1-this_score.prob_win;
				this_ret_width = this_score.prob_win;
			}*/
			var stroke_multiplier = 50;
			var this_opacity = 1;//this_score.zscore/2;
			/* TODO: Linear color scale on circle, not stroke*/
			/* TOOD: When server is picked, 1- on reciever, and vice versa */
			//rgba(65,175,127,1)

			var this_score_bubble = $scope.net.select('#sb_'+this_score.score_self+'_'+this_score.score_oppt);
			var this_ser_stroke = $scope.net.select('#ser_'+this_score.score_self+'_'+this_score.score_oppt);
			var this_rec_stroke = $scope.net.select('#rec_'+this_score.score_self+'_'+this_score.score_oppt);

			this_rec_stroke
				.transition().duration(1500).delay(i*30)
				.style('stroke','#f1af8e')
				.style('stroke-width',stroke_multiplier*(this_width)).transition().duration(1500).delay(1500+i*30)
				.style('stroke-opacity',this_opacity);

			this_ser_stroke
				.transition().duration(1500).delay(i*30)
				.style('stroke','#b0d5e1')
				.style('stroke-width',stroke_multiplier*this_ret_width).transition().duration(1500).delay(1500+i*30)
				.style('stroke-opacity',this_opacity);

			this_score_bubble
				.transition().duration(2000)
				.style('fill',$scope.zScore2Color(this_score.zscore));

			//TODO: Need to pass all elements into a keyed angular object that can be accessed outside of scope
			/*this_rec_stroke
				.on('mouseover', function() {
																			console.log(this_score.zscore);
																			this_rec_stroke.style("stroke-opacity", this_rec_stroke.attr('stroke-opacity')*0.25);
																			$scope.hover_message = "Zscore: " + this_score.zscore;
																		});

			this_ser_stroke
				.on('mouseover', function() {
																			this_rec_stroke.style("stroke-opacity", this_rec_stroke.attr('stroke-opacity')*0.25);
																			$scope.hover_message = "Zscore: " + this_score.zscore;
																		});
																		*/
		}
	};

	$scope.zScore2Color = function(zscore) {
		var bad = [255,0,0,1];
		var good = [0, 255, 75, 1];
		var bad_score = {
			"r":bad[0],
			"g":bad[1],
			"b":bad[2],
			"a":bad[3]
		}
		var good_score = {
			"r":good[0],
			"g":good[1],
			"b":good[2],
			"a":good[3]
		}

		var percent = zscore/2;

		var return_color = {
			"r":Math.floor(good_score.r + percent * (bad_score.r - good_score.r)),
			"g":Math.floor(good_score.g + percent * (bad_score.g - good_score.g)),
			"b":Math.floor(good_score.b + percent * (bad_score.b - good_score.b))
		};
		return $scope.rgbToHex(return_color.r, return_color.g, return_color.b);
	};

	$scope.componentToHex = function(c) {
		var hex = c.toString(16);
		return hex.length == 1 ? "0" + hex : hex;
	}

	$scope.rgbToHex = function(r, g, b) {
		return "#" + $scope.componentToHex(r) + $scope.componentToHex(g) + $scope.componentToHex(b);
	}

}])


ngAppControllers.controller('homeController', ['$scope','$http', '$routeParams', function($scope, $http, $routeParams) {
	//Example of a basic controller, includes ability to make HTTP requests
	$scope.player = $routeParams.player;
	$scope.loading = true;

	$scope.selectedOption = "";

	$scope.heatmap_grid = [
		[0,0,0,0,0],
		[0,0,0,0,0],
		[0,0,0,0,0],
		[0,0,0,0,0],
		[0,0,0,0,0]
	];

	$http.get('https://dev13895.service-now.com/tennis_heatmaps.do')
		.success(function(data){
			$scope.players = data;
			$scope.initializeAutocomplete();
			console.log(data);
			//setTimeout(function(){ applySelect(); }, 100);
		});

	$scope.getData = function(player) {
		console.log(player);
		$scope.data = null;
		$http.get('https://dev13895.service-now.com/tennis_heatmaps.do?player=' + player)
			.success(function(data){
				$scope.data = data;

				$scope.generate_heatmap();
				$scope.heatItUp();
			});
	};

	$scope.initializeAutocomplete = function () {
		$('#autocomplete_tennis_player').autocomplete({
			lookup: $scope.players.data,
			onSearchStart: function(query){$scope.loading=true},
			onSearchComplete: function(query){$scope.loading=false},
			onSelect: function (suggestion) {
				console.log(suggestion)
			},
			showNoSuggestionNotice: true,
			noSuggestionNotice: 'Sorry, no matching names'
		});
	};

	$scope.message = "";

	$scope.mouseOver = function(data) {
		$scope.message = data;
	};

	$scope.heatItUp = function() {
		for (var i = 0; i<$scope.data.heatmap_data.length; i++) {
			var thisPoint = $scope.data.heatmap_data[i];
			var x_val = thisPoint[0];
			var y_val = thisPoint[1];
			var p_val = thisPoint[2];
			$scope.heatmap_grid[y_val][x_val] = p_val;
		}
		console.log($scope.heatmap_grid);
	}

	function applySelect() {
			$(document).ready(function() {
				$scope.$apply();
				$('select').material_select();
			});
	}


	$scope.generate_heatmap = function() {
		$('#container').highcharts({

			 chart: {
					 type: 'heatmap',
					 marginTop: 40,
					 marginBottom: 20,
					 marginRight: 150,
					 marginLeft: 150,
					 animation:true,
					 plotBorderWidth: 1
			 },


			 title: {
					 text: $scope.data.player + '\'s win probabilities in every match situation'
			 },

			 xAxis: {
					 categories: ['0','15','30','40','ADV'],
					 title: "Djokovic"
			 },

			 yAxis: {
					 categories: ['0','15','30','40','ADV'],
					 title: "null"
			 },

			 colorAxis: {
					 min: 0,
					 minColor: '#FFFFFF',
					 //minColor: Highcharts.getOptions().colors[4],
					 maxColor: Highcharts.getOptions().colors[1]
			 },

			 legend: {
					 align: 'left',
					 layout: 'vertical',
					 margin: 0,
					 verticalAlign: 'top',
					 y: 25,
					 symbolHeight: 280
			 },

			 tooltip: {
					 formatter: function () {
						 	//console.log(this.point);
							 return '<b>' + this.series.yAxis.categories[this.point.y] + ' - ' +
									 this.series.xAxis.categories[this.point.x] + '</b><br/><h3>' + Math.floor(this.point.value*100) + "%</h3> Win Probability";
					 }
			 },

			 series: [{
					 name: 'Sales per employee',
					 borderWidth: 0,
					 //data: [[0,0,0.70009738],[0,1,0.65259743],[0,2,0.66355139],[0,3,0.6388889],[1,0,0.66342139],[1,1,0.67945826],[1,2,0.67136151],[1,3,0.65591395],[2,0,0.7148847],[2,1,0.73913044],[2,2,0.68871593],[2,3,0.67375886],[3,0,0.6979472],[3,1,0.6690141],[3,2,0.68867922],[3,3,0.67987806],[3,4,0.60000002],[4,3,0.68161434]],
					 data: $scope.data.heatmap_data,
					 dataLabels: {
							 enabled: false,
							 color: '#000000'
					 }
			 }]

	 });
	}


}]);


ngAppControllers.controller('urlParamsController', ['$scope', '$routeParams', function($scope, $routeParams) {
	//Example of a basic controller, includes ability to pull route parameters ($routeParams.name defined in app.js routing configuration)
	$scope.data = $routeParams.name + " from URL parameter";
}]);
