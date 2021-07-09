const colors=['#3366cc','#dc3912','#ff9900','#109618','#990099','#0099c6','#dd4477','#66aa00','#b82e2e','#316395','#994499','#22aa99','#aaaa11','#6633cc','#e67300','#8b0707','#651067','#329262','#5574a6','#3b3eac','#b77322','#16d620','#b91383','#f4359e','#9c5935','#a9c413','#2a778d','#668d1c','#bea413','#0c5922','#743411']
const backgroundColors=colors.map(color => color + "AA")
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const epoch = new Date(0);
const today=new Date();

function resume_capitalize(str) {
  var splitStr = str.toLowerCase().split(' ');
   for (var i = 0; i < splitStr.length; i++) {
       splitStr[i] = splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);     
   }
   return splitStr.join(' '); 
}


function resume_dateToFriendly(inboundDate)
{
	if(inboundDate.getMonth() == 0)
	{
		return monthNames[11] + " " + (inboundDate.getFullYear() -1);
	}
	return monthNames[inboundDate.getMonth()-1] + " " + inboundDate.getFullYear();
}

function resume_string_to_date(inboundString)
{
	if(inboundString==null)
	{
		return null;
	}
	var parts=inboundString.split('-')
	return new Date(parts[0], parts[1], parts[2]);
}

function resume_monthsToDuration(totalMonths)
{
	durationFriendly="";
	var diff_years = Math.floor(totalMonths/ 12);
	var diff_month = totalMonths % 12;
	if(diff_years > 0)
	{
		if(diff_month == 0)
		{
			durationFriendly=diff_years + " years"
		}
		else
		{
			durationFriendly=diff_years + " years, " + diff_month + " months";
		}
	}
	else
	{
		if(diff_month > 0)
		{
			durationFriendly=diff_month + " months"
		}
	}
	return durationFriendly;
}

function resume_spanToDuration(start,end)
{
	var startFriendly="Before I can remember";
	var totalMonths=0;
	if(start==null)
	{
		start=epoch;
	}
	if(start!=epoch)
	{
		startFriendly=Resume.dateToFriendly(start);
	}
	var endFriendly="Present";
	if(end!=null)
	{
		if(end!=today)
		{
			endFriendly=Resume.dateToFriendly(end);
		}
	}
	else
	{
		var end=today;
	}
	durationFriendly="";
	if(start!=epoch)
	{
		var endMonths=(end.getYear() * 12) + end.getMonth() + 1; //round up because if someone did from feb one year to jan the next year they probably did 1 year and just marked it back a bit
		var startMonths=(start.getYear() * 12) + start.getMonth();
		totalMonths=endMonths - startMonths;
		var durationFriendly=Resume.monthsToDuration(totalMonths);
	}
	return {
		"range":{
			"start":startFriendly,
			"end":endFriendly,
			"months":totalMonths
		},
		"duration":durationFriendly
	}
}


var initialized = false
function initialize(domainWhitelist)
{
    if (initialized)
    {
        return Promise.resolve(Resume.Context);
    }
    return new Promise(function(resolve, reject)
    {
        try
        {
			//var url="configurables/config.json"; //example template
			var url="https://raw.githubusercontent.com/camstillhere/Resume-Resources/main/configurables/config.json";
			const urlParams = new URLSearchParams(window.location.search);
			const configUrl = urlParams.get('config');
			if(configUrl!=null)
			{
				url=configUrl;
			}
			else
			{
				window.history.pushState("", "", 'index.html?config=' + url);
			}
			resolve(fetch(url).then(function(response)
			{
				return response.json();
			}).then(function(config) {
				var index=0;
				for(var orgName in config.organisations)
				{
					config.organisations[orgName].color=colors[index];
					config.organisations[orgName].bgcolor=backgroundColors[index];
					if(config.organisations[orgName].icon==null)
					{
						config.organisations[orgName].icon="img/orgLogo.png";
					}
					index=(index+1) % colors.length;
				}
				for (var k in config){
					switch(k)
					{
						case "organisations":
							
							break;
						case "references":
							for (var index in config[k]){
								config[k][index].author.date=Resume.string_to_date(config[k][index].author.date);
								config[k][index].author.friendlyDate=Resume.dateToFriendly(config[k][index].author.date);
							}
							config.references.sort(function(a, b){ return b.author.date-a.author.date;});
							break;
						case "bio":
							config[k].first=Resume.capitalize(config[k].first);
							config[k].last=Resume.capitalize(config[k].last);
							config[k].title=Resume.capitalize(config[k].title);
							if(config[k].image==null)
							{
								config[k].image="img/profilePic.png";
							}
							break;
						case "educations":
						case "experiences":
							//convert strings to dates
							//sort positions by descending end date
							//sort orgs by descending end date of last position
							for(var orgIndex in config[k])
							{
								var orgDetails=config.organisations[config[k][orgIndex].organisation]
								if(orgDetails === undefined)
								{
									console.log("please define org:" + config[k][orgIndex].organisation);
									return reject("failure to register all required organisations");
								}
								for (var field in orgDetails){
									config[k][orgIndex][field]=orgDetails[field];
								}
								earliestDate=today;
								latestDate=epoch;
								var orgMonthsTotal=0;
								field="certifications";
								if("positions" in config[k][orgIndex])
								{
									field="positions"
								}
								for(var listIndex in config[k][orgIndex][field])
								{
									if(field=="certifications")
									{
										config[k][orgIndex][field][listIndex].qualification=Resume.capitalize(config[k][orgIndex][field][listIndex].qualification);
									}
									span=config[k][orgIndex][field][listIndex].span;
									span.start=Resume.string_to_date(span.start);
									span.end=Resume.string_to_date(span.end);
									if(span.end==null)
									{
										latestDate=today;
									}
									if(span.start==null)
									{
										earliestDate=epoch;
									}
									if(span.start < earliestDate)
									{
										earliestDate=span.start;
									}
									if(span.end > latestDate)
									{
										latestDate=span.end;
									}
									details=Resume.spanToDuration(span.start,span.end)
									span.range=details.range;
									span.duration=details.duration;
									orgMonthsTotal+=span.range.months;
									config[k][orgIndex][field][listIndex].span=span;
								}
								orgSpanDetails=Resume.spanToDuration(earliestDate,latestDate);
								config[k][orgIndex].span={
									"start":earliestDate,
									"end":latestDate,
									"duration":Resume.monthsToDuration(orgMonthsTotal),
									"range":orgSpanDetails.range,
								}
								config[k][orgIndex][field].sort(function(a, b){
									endCompare=new Date();
									if(b.span.end!=null)
									{
										endCompare=b.span.end;
									}
									startCompare=epoch;
									if(a.span.end!=null)
									{
										startCompare=a.span.end;
									}
									return endCompare-startCompare;
									
								});
							}
							config[k]=config[k].sort(function(a, b){
									endCompare=new Date();
									if(b.span.end!=null)
									{
										endCompare=b.span.end;
									}
									startCompare=epoch;
									if(a.span.end!=null)
									{
										startCompare=a.span.end;
									}
									return endCompare-startCompare;
									
								});
							break;
						default:
							//do no change
					}
												
					Resume[k]=config[k];
				}
				return fetch("configurables/data.json").then(function(response)
				{
					return response.json();
				}).then(function(data)
				{
					Resume.Data=data
				});
			}));
				
        }
        catch (err)
        {
            reject(err);
        }
    })
}


window.Resume = {
    initialize: initialize,
	spanToDuration:resume_spanToDuration,
	dateToFriendly:resume_dateToFriendly,
	capitalize:resume_capitalize,
	string_to_date:resume_string_to_date,
	monthsToDuration:resume_monthsToDuration,
	bio:{},
	experiences:[],
	educations:{},
	overview:{},
	references:[],
	Data:[]
};

window.onload=function(e)
{
	Resume.initialize().then(success => {
		ready();
	});
}
