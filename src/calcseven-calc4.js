
function roundcut (val)
{
	var x = val;

	if (val && Object.prototype.toString.call(val) === '[object Function]')
		x = val();

	x = x.toString().replace(/(\.\d{0,2}).*/, "$1");
	return Number(x);
};

jQuery(document).ready(function()
{
	var data =
	{
		/*common*/
		business_name : "Sample Company",

		/*sensivity analysis*/
		utilisation_labour : 0, // in procent

		/*STAFFING COSTS & OVERHEADS*/
		staffing_cost_chargeable : 300000,
		administration : 120000,
		professional : 80000,
		office_running : 100000,
		rent : 150000,
		motor_rent : 100000,
		staffing_cost : 250000,
		interest : 20000,

		/*key drives*/
		positions :
		[
			"Chargeable Staff Pos #1",
			"Chargeable Staff Pos #2",
			"Chargeable Staff Pos #3",
			"Chargeable Staff Pos #4",
		],

		keydrives :
		[
			{
				dt : new Date(2015, 06, 13),
				no_working_days: 23,
				avg_hour_per_week: 42,
				part_sales : 50,
				margin : 27,

				number : [1, 2, 2, 3],
				labour : [100, 90, 80, 80],
				utilisation : [70, 90, 95, 95],
				recovery : [90, 90, 95, 95],
			},
			{
				dt : new Date(2015, 07, 13),
				no_working_days: 21,
				avg_hour_per_week: 42,
				part_sales : 50,
				margin : 27,

				number : [1, 3, 2, 2],
				labour : [99, 95, 85, 85],
				utilisation : [71, 91, 95, 95],
				recovery : [92, 92, 95, 95],
			},
		],
	};


	function Model (v)
	{
		this.business_name = ko.observable(v.business_name);

		/*sensivity analysis*/
		this.utilisation_labour = ko.observable(v.utilisation_labour);

		/*STAFFING COSTS & OVERHEADS*/
		this.staffing_cost_chargeable = ko.observable(v.staffing_cost_chargeable);
		this.administration = ko.observable(v.administration);
		this.professional = ko.observable(v.professional);
		this.office_running = ko.observable(v.office_running);
		this.rent = ko.observable(v.rent);
		this.motor_rent = ko.observable(v.motor_rent);
		this.staffing_cost = ko.observable(v.staffing_cost);
		this.interest = ko.observable(v.interest);

		this.overheads_sum = ko.computed(function() { return Number(this.administration())
				+ Number(this.professional())
				+ Number(this.office_running())
				+ Number(this.rent())
				+ Number(this.motor_rent())
				+ Number(this.staffing_cost())
				; }, this);

		var kd = [];

		for (var asdf =0; asdf < 4; asdf++) { //debug
		for(keydrives_index in v.keydrives)
		{
			var ki = v.keydrives[keydrives_index];
			var kdi = new Object();
			kdi.parent = this;
			for(a in ki)
			{
				if ( Object.prototype.toString.call(ki[a])==='[object Array]')
				{
					var obs_array = [];
					for(ai in ki[a])
					{
						obs_array.push( ko.observable(ki[a][ai]) );
					}
					kdi[a] = ko.observableArray(obs_array);

					kdi[a+'_sum'] = ko.computed(function(){
						var s = 0;
						ko.utils.arrayForEach(this(), function(item)
							{
								s += Number(item());
							});
						return s;
					}, kdi[a]);
				}
				else
				{
					kdi[a] = ko.observable(ki[a]);
				}
			}

			kdi.no_working_days_leave = ko.pureComputed(function() { return this.no_working_days()*0.894; }, kdi );

			kdi.capacity = ko.observableArray([]);
			kdi.actual_hours = ko.observableArray([]);
			for (position_index in v.positions)
			{
				// capacity
				var fn = (
					function(i)
					{
						return ko.computed(function(){ return this.number()[i]() * this.avg_hour_per_week() / 5 * this.no_working_days_leave(); },  kdi);
					}
				)(position_index);

				kdi.capacity.push( fn );

				// capacity
				fn = (
					function(i)
					{
						return ko.computed(
							function()
							{
								return this.utilisation()[i]() * (100 + this.parent.utilisation_labour()) / 10000
									* this.recovery()[i]() * (100 + this.parent.utilisation_labour()) / 10000
									* this.capacity()[i]()
								;
							},
							kdi
						);
					}
				)(position_index);

				kdi.actual_hours.push( fn );
			}
			kdi.capacity_sum = ko.computed(function(){
				var s = 0;
				ko.utils.arrayForEach(this.capacity(), function(item)
					{
						s += Number(item());
					});
				return s;
			}, kdi);
			kdi.actual_hours_sum = ko.computed(function(){
				var s = 0;
				ko.utils.arrayForEach(this.actual_hours(), function(item)
					{
						s += Number(item());
					});
				return s;
			}, kdi);
			kd.push(kdi);
		}
		} // debug
		this.keydrives = ko.observableArray(kd);

		this.positions = v.positions;
	};

	ko.applyBindings(new Model(data));
});
