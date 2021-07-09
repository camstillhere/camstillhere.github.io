function adjustDetail(level)
{
	document.getElementById('mainPage').className='detail-level-' + level;
}

function ready()
{
	document.getElementById('profilePic').style.backgroundImage = "url('" + Resume.bio.image + "')";
	document.getElementById('bio-last').innerText=Resume.bio.last;
	document.getElementById('bio-first').innerText=Resume.bio.first;
	document.title=Resume.bio.first + " " + Resume.bio.last;
	contactDetails=document.getElementById('contactDetails');
	document.getElementById('profileTitle').innerText=Resume.bio.title;
	for (var contactType in Resume.bio.contact)
	{
		Resume.bio.contact[contactType].forEach((entry) => 
		{
			var li = document.createElement('li');
			li.setAttribute('class',contactType);
			var a = document.createElement('a');
			a.innerText=entry.title;
			switch(contactType)
			{
				case "phone":
					a.href="tel:" + entry.content.replace(/ /g,'');
					break;
				case "email":
					a.href="mailto:" + entry.content;
					break;
				default:
					a.href=entry.content;
			}
			li.appendChild(a)
			contactDetails.appendChild(li);
		});
	}
	document.getElementById('overview-title').innerText=Resume.overview.title;
	var scrollContainer=document.getElementById('scrollContainer');
	Resume.references.forEach((entry) =>
	{
		var scrollBlock=document.createElement('div');
		scrollBlock.className='scrollBlock';
		var quote=document.createElement('div');
		quote.className='quote';
		quote.innerText='"' + entry.blurb + '"';
		scrollBlock.appendChild(quote);
		var author=document.createElement('author');
		author.className='author';
		["name","position","organisation","friendlyDate"].forEach((authorField) =>
		{
			var authorFieldItem=document.createElement('div');
			authorFieldItem.class=authorField;
			authorFieldItem.innerText=entry.author[authorField];
			author.appendChild(authorFieldItem);
		});
		scrollBlock.appendChild(author);
		scrollContainer.appendChild(scrollBlock);

	});
	
	
	Resume.overview.blurb.forEach((entry) => 
	{
		var li = document.createElement('li');
		li.innerText=entry;
		document.getElementById('overview-blurb').appendChild(li);
	});
	var experiencesWrapper=document.getElementById('experiencesWrapper');
	var experiencesMonthCountByOrg={
		
	}
	if(Resume.experiences.length ==0)
	{
		experiencesWrapper.style.visibility="hidden";
	}
	else
	{
		
		Resume.experiences.forEach((organisation) =>
		{
			var orgBlock = document.createElement('div');
			if(organisation.positions.length == 1)
			{
				orgBlock.className='single';
			}
			else
			{
				orgBlock.className='multiple';
			}
			orgBlock.classList.add("orgBlock");
			var orgHeader=document.createElement('a');
			orgHeader.className="orgHeader";
			orgHeader.href=organisation.link;
			var orgTitle = document.createElement('h2');
			orgTitle.classList.add("orgTitle");
			orgTitle.innerText=organisation.organisation;
			orgHeader.appendChild(orgTitle);
			
			var orgLogo=document.createElement('div');
			orgLogo.style.backgroundImage = "url('" + organisation.icon + "')";
			orgLogo.classList.add("logo");
			orgLogo.title=organisation.blurb.join("\n\n");
			orgHeader.appendChild(orgLogo);
			var orgDuration = document.createElement('div');
			orgDuration.classList.add("orgDuration");
			orgDuration.innerText=organisation.span.range.start + " - " + organisation.span.range.end + "\n" + organisation.span.duration;
			orgHeader.appendChild(orgDuration);
			
			orgBlock.appendChild(orgHeader);
			
			
			organisation.positions.forEach((position) =>
			{
				var positionBlock = document.createElement('div');
				positionBlock.className='positionBlock';
				var positionTitle=document.createElement('h3');
				positionTitle.classList.add('positionTitle');
				positionTitle.innerText=position.title;
				positionBlock.appendChild(positionTitle);
				var positionDuration=document.createElement('div');
				positionDuration.classList.add('positionDuration');
				positionDuration.innerText=position.span.range.start + " - " + position.span.range.end + "\n" + position.span.duration;
				positionBlock.appendChild(positionDuration);
				var positionBlurb=document.createElement('ul');
				positionBlurb.classList.add('blurb');
				position.blurb.forEach((entry) => 
				{
					var li = document.createElement('li');
					li.innerText=entry;
					positionBlurb.appendChild(li);
				});
				positionBlock.appendChild(positionBlurb);
				
				if(position.responsibilities.length > 0)
				{
					var responsibilities=document.createElement('h4');
					responsibilities.innerText="Responsibilities"
					positionBlock.appendChild(responsibilities);
					var responsibilitiesList=document.createElement('ul');
					responsibilitiesList.className="dotPoints";
					position.responsibilities.forEach((entry) =>
					{
						var responsibilityPoint=document.createElement('li');
						responsibilityPoint.innerText=entry;
						responsibilitiesList.appendChild(responsibilityPoint);
					});
					positionBlock.appendChild(responsibilitiesList);
					
				}
				
				if(position.achievements.length > 0)
				{
					var achievements=document.createElement('h4');
					achievements.innerText="Achievements"
					positionBlock.appendChild(achievements);
					var achievementsList=document.createElement('ul');
					achievementsList.className="dotPoints";
					position.achievements.forEach((entry) =>
					{
						var achievementPoint=document.createElement('li');
						achievementPoint.innerText=entry;
						achievementsList.appendChild(achievementPoint);
					});
					positionBlock.appendChild(achievementsList);
					
				}
				
				orgBlock.appendChild(positionBlock);
			});
			document.getElementById('experiencesWrapper').appendChild(orgBlock);
		});
	}
	
	var educationsWrapper=document.getElementById('educationsWrapper');
	if(Resume.educations.length ==0)
	{
		educationsWrapper.style.visibility="hidden";
	}
	else
	{
		Resume.educations.forEach((organisation) =>
		{
			organisation.certifications.forEach((position) =>
			{
				var certificationBlock = document.createElement('div');
				certificationBlock.classList.add("certificationBlock");
				var instituteHeader=document.createElement('a');
				instituteHeader.className="instituteHeader";
				instituteHeader.href=organisation.link;
				var orgLogo=document.createElement('div');
				orgLogo.style.backgroundImage = "url('" + organisation.icon + "')";
				orgLogo.classList.add("logo");
				orgLogo.title=organisation.blurb.join("\n\n");
				instituteHeader.appendChild(orgLogo);			
				var instituteTitle = document.createElement('h2');
				instituteTitle.classList.add("instituteTitle");
				instituteTitle.innerText=organisation.organisation;
				instituteHeader.appendChild(instituteTitle);
				certificationBlock.appendChild(instituteHeader);
				var certificationDetailsBlock = document.createElement('div');
				certificationDetailsBlock.classList.add('certificationDetailsBlock');
				var educationTitle=document.createElement('h3');
				educationTitle.classList.add('educationTitle');
				educationTitle.innerText=position.qualification  + ", " + position.title;
				certificationDetailsBlock.appendChild(educationTitle);
				var positionDuration=document.createElement('div');
				positionDuration.classList.add('positionDuration');
				positionDuration.innerText=position.span.range.end;
				certificationDetailsBlock.appendChild(positionDuration);
				var positionBlurb=document.createElement('ul');
				positionBlurb.classList.add('blurb');
				position.blurb.forEach((entry) => 
				{
					var li = document.createElement('li');
					li.innerText=entry;
					positionBlurb.appendChild(li);
				});
				certificationDetailsBlock.appendChild(positionBlurb);
				
				certificationBlock.appendChild(certificationDetailsBlock);
				document.getElementById('educationsWrapper').appendChild(certificationBlock);
			});
		});
	}
	
	// charting
	
	Resume.experiences.sort(function(a, b){return b.span.range.months-a.span.range.months})
	// EXPERIENCES BY YEAR DOUGHNUT
	const experiences_by_year_doughnut = {
	  type: 'doughnut',
	  data: {
		  labels: Resume.experiences.map(orgDetails => orgDetails.organisation),
		  datasets: [
			{
			  data: Resume.experiences.map(orgDetails => orgDetails.span.range.months /12),
			  borderColor: Resume.experiences.map(orgDetails => orgDetails.color),
			  backgroundColor: Resume.experiences.map(orgDetails => orgDetails.bgcolor)
			}
		  ]
		},
	  options: {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
		  legend: {
			position: 'left',
		  },
		  title: {
			display: true,
			text: 'Years Experience Breakdown'
		  }
		}
	  },
	};
	var ctx = document.getElementById('experienceChart').getContext('2d');
	var myChart = new Chart(ctx, experiences_by_year_doughnut);
	
	// REFERENCES BY YEAR, SIZE BY QUANTITY SCATTER
	
	//determining range of years

	var intyears=Resume.references.map(r => r.author.date.getFullYear())
	var min=Math.min.apply(null,intyears);
	var max=Math.max.apply(null,intyears);
	years={}
	for(var i = min-1; i < max; i++) {
		years[i]=0
	}
	yearKeys=Object.keys(years).sort();
	
	var datasets=[]
	for(var orgName in Resume.organisations)
	{
		var cacheYears={};
		for(var i = min-1; i < max; i++) {
			cacheYears[i]=0
		}
		var totalRefs=0;
		Resume.references.forEach((entry)=>
		{
			if(entry.author.organisation==orgName)
			{
				cacheYears[entry.author.date.getFullYear()]=cacheYears[entry.author.date.getFullYear()] +1;
				totalRefs=totalRefs+1;
			}
		});
		if(totalRefs > 0)
		{
			datasets.push({
			  label:orgName,
			  data: yearKeys.map(yearCount => cacheYears[yearCount]),
			  borderColor: Resume.organisations[orgName].color,
			  backgroundColor: Resume.organisations[orgName].bgcolor,
			});
		}
	}
	
	const references_by_year_and_quantity = {
	  type: 'line',
	  data: {
		  labels: yearKeys,
		  datasets: datasets
		},
	  options: {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
		  x: {
			stacked: false,
			ticks: {
			  stepSize: 1
			}
		  },
		  y: {
			stacked: false,
			ticks: {
			  stepSize: 1
			}
		  }
		},
		plugins: {
		  legend: {
			position: 'left',
		  },
		  title: {
			display: true,
			text: 'References by Year and Organisation '
		  }
		}
	  },
	};
	var ctx = document.getElementById('referenceChart').getContext('2d');
	var myChart = new Chart(ctx, references_by_year_and_quantity);
	
	
	// Education 
	
	var datasets=[];
	var cacheQualifications={
		"Master":0,
		"Bachelor":0,
		"Diploma":0,
		"Certificate 3":0,
		"Certificate 2":0,
		"Certificate 1":0,
		"Certificate":0,
		
	};
	for(var index in Resume.educations)
	{
		orgName=Resume.educations[index].organisation;
		var cacheCerts={};
		Resume.educations[index].certifications.forEach((entry)=>
		{
			cacheQualifications[entry.qualification]=1;
		});
	}
	for(var key in cacheQualifications)
	{
		if(cacheQualifications[key]==0)
		{
			delete cacheQualifications[key];
		}
	}
	for(var index in Resume.educations)
	{
		orgName=Resume.educations[index].organisation;
		var thisOrgCache={};
		for(var key in cacheQualifications)
		{
			thisOrgCache[key]=null;
		}
		var found=false;
		Resume.educations[index].certifications.forEach((entry)=>
		{
			thisOrgCache[entry.qualification]=thisOrgCache[entry.qualification]+1;
			found=true;
		});
		datasets.push({
		  label:orgName,
		  data: Object.values(thisOrgCache),
		  borderColor: Resume.organisations[orgName].color,
		  backgroundColor: Resume.organisations[orgName].bgcolor,
		});
	}
	
	const qualifications_by_org = {
	  type: 'bar',
	  data: {
		  labels: Object.keys(cacheQualifications),
		  datasets: datasets
		},
	  options: {
		  indexAxis: 'y',
		responsive: true,
		maintainAspectRatio: false,
		scales: {
		  x: {
			stacked: true,
			ticks: {
			  stepSize: 1
			}
		  },
		  y: {
			stacked: true
		  }
		},
		plugins: {
		  legend: {
			position: 'off',
		  },
		  title: {
			display: true,
			text: 'Quantity by Education and Institute'
		  }
		}
	  },
	};
	var ctx = document.getElementById('educationChart').getContext('2d');
	var myChart = new Chart(ctx, qualifications_by_org);
	
	
	// Tenure 
	
	var datasets=[]
	for(var index in Resume.experiences)
	{
		orgName=Resume.experiences[index].organisation;
		dataPoints=Resume.experiences[index].positions.map(position =>
		{
			return {
				"y":Resume.experiences[index].span.range.months / 12,
				"x":position.span.range.months / 12,
				"r":Resume.references.map(reference=>{
					if(reference.author.organisation==orgName)
					{
						referenceDate=reference.author.date;
						if(referenceDate <= position.span.end)
						{
							if(referenceDate => position.span.start)
							{
								return 1;
							}
						}
					}
					return 0;
				}).reduce((a, b) => a + b, 0) +1
			}
		});
		datasets.push({
		  label:orgName,
		  data: dataPoints,
		  borderColor: Resume.organisations[orgName].color,
		  backgroundColor: Resume.organisations[orgName].bgcolor,
		});
	}
	
	const tenure_by_role_and_org = {
	  type: 'bubble',
	  data: {
		  labels: Resume.experiences.map(orgDetails => orgDetails.organisation),
		  datasets: datasets
		},
	  options: {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
		  x: {
			title:{
				text:"Years in this role",
				display:true
			},
			ticks: {
			  stepSize: 1
			}
		  },
		  y: {
			title:{
				text:"Total years in organisation",
				display:true
			},
			ticks: {
			  stepSize: 1
			}
		  }
		},
		plugins: {
		  legend: {
			position: 'top',
		  },
		  title: {
			display: true,
			text: 'Role time verse Organisation total time, scale by references'
		  }
		}
	  },
	};
	var ctx = document.getElementById('tenureChart').getContext('2d');
	var myChart = new Chart(ctx, tenure_by_role_and_org);
}