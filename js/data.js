/**
 * data.js — School Directory Data
 *
 * To add a college:  push an entry into the right category in COL_DIR
 * To add a HS:       push an entry into the right category in HS_DIR
 * To add a category: add a new key with an array value
 *
 * Entry shape (college):
 * { name, city, url, tags: string[], type }
 *
 * Entry shape (high school):
 * { name, city, url, tags: string[], type }
 */

const COL_DIR = {
  "Ivy League": [
    { name:"Harvard University",           city:"Cambridge, MA",      url:"harvard.edu",    tags:["Research","Private","T10"],          type:"Private Research University" },
    { name:"Yale University",              city:"New Haven, CT",      url:"yale.edu",        tags:["Research","Private","T10"],          type:"Private Research University" },
    { name:"Princeton University",         city:"Princeton, NJ",      url:"princeton.edu",   tags:["Research","Private","T10"],          type:"Private Research University" },
    { name:"Columbia University",          city:"New York, NY",       url:"columbia.edu",    tags:["Research","Urban","T10"],            type:"Private Research University" },
    { name:"University of Pennsylvania",   city:"Philadelphia, PA",   url:"upenn.edu",       tags:["Research","Business","T10"],         type:"Private Research University" },
    { name:"Brown University",             city:"Providence, RI",     url:"brown.edu",       tags:["Liberal Arts","Private","T10"],      type:"Private Research University" },
    { name:"Dartmouth College",            city:"Hanover, NH",        url:"dartmouth.edu",   tags:["Liberal Arts","Private"],            type:"Private Research University" },
    { name:"Cornell University",           city:"Ithaca, NY",         url:"cornell.edu",     tags:["Research","STEM","T10"],             type:"Private Research University" },
  ],

  "Top Public Universities": [
    { name:"University of California, Los Angeles", city:"Los Angeles, CA",    url:"ucla.edu",      tags:["Public","Research","T25"],    type:"Public Research University" },
    { name:"University of Michigan",                city:"Ann Arbor, MI",      url:"umich.edu",     tags:["Public","Research","T25"],    type:"Public Research University" },
    { name:"University of Virginia",                city:"Charlottesville, VA",url:"virginia.edu",  tags:["Public","Liberal Arts","T25"],type:"Public Research University" },
    { name:"University of North Carolina",          city:"Chapel Hill, NC",    url:"unc.edu",       tags:["Public","Research"],          type:"Public Research University" },
    { name:"University of Texas at Austin",         city:"Austin, TX",         url:"utexas.edu",    tags:["Public","STEM","Research"],   type:"Public Research University" },
    { name:"Georgia Institute of Technology",       city:"Atlanta, GA",        url:"gatech.edu",    tags:["Public","STEM","Engineering"],type:"Public Research University" },
    { name:"University of Florida",                 city:"Gainesville, FL",    url:"ufl.edu",       tags:["Public","Research","SEC"],    type:"Public Research University" },
    { name:"University of Wisconsin–Madison",       city:"Madison, WI",        url:"wisc.edu",      tags:["Public","Research","Big Ten"],type:"Public Research University" },
    { name:"University of California, Berkeley",    city:"Berkeley, CA",       url:"berkeley.edu",  tags:["Public","STEM","T10"],        type:"Public Research University" },
    { name:"University of Illinois Urbana-Champaign",city:"Champaign, IL",     url:"illinois.edu",  tags:["Public","STEM","Big Ten"],    type:"Public Research University" },
  ],

  "HBCUs": [
    { name:"Howard University",               city:"Washington, D.C.",   url:"howard.edu",    tags:["HBCU","Research","Private"],       type:"HBCU — Private Research University" },
    { name:"Spelman College",                  city:"Atlanta, GA",        url:"spelman.edu",   tags:["HBCU","Women's","Liberal Arts"],  type:"HBCU — Women's Liberal Arts College" },
    { name:"Morehouse College",                city:"Atlanta, GA",        url:"morehouse.edu", tags:["HBCU","Men's","Liberal Arts"],    type:"HBCU — Men's Liberal Arts College" },
    { name:"Florida A&M University",           city:"Tallahassee, FL",    url:"famu.edu",      tags:["HBCU","Public","STEM"],           type:"HBCU — Public Research University" },
    { name:"Hampton University",               city:"Hampton, VA",        url:"hamptonu.edu",  tags:["HBCU","Private","Research"],      type:"HBCU — Private University" },
    { name:"Tuskegee University",              city:"Tuskegee, AL",       url:"tuskegee.edu",  tags:["HBCU","Engineering","STEM"],      type:"HBCU — Private University" },
    { name:"Xavier University of Louisiana",   city:"New Orleans, LA",    url:"xula.edu",      tags:["HBCU","Pre-Med","Catholic"],      type:"HBCU — Private University" },
    { name:"North Carolina A&T State University",city:"Greensboro, NC",   url:"ncat.edu",      tags:["HBCU","Public","Engineering"],    type:"HBCU — Public University" },
    { name:"Meharry Medical College",          city:"Nashville, TN",      url:"mmc.edu",       tags:["HBCU","Medical","Private"],       type:"HBCU — Medical College" },
    { name:"Prairie View A&M University",      city:"Prairie View, TX",   url:"pvamu.edu",     tags:["HBCU","Public","Engineering"],    type:"HBCU — Public University" },
  ],

  "Top Engineering & STEM": [
    { name:"Massachusetts Institute of Technology", city:"Cambridge, MA",    url:"mit.edu",          tags:["STEM","Research","Private","#1"], type:"Private Research University" },
    { name:"California Institute of Technology",    city:"Pasadena, CA",     url:"caltech.edu",      tags:["STEM","Research","Private"],      type:"Private Research University" },
    { name:"Carnegie Mellon University",            city:"Pittsburgh, PA",   url:"cmu.edu",          tags:["CS","Engineering","Research"],    type:"Private Research University" },
    { name:"Purdue University",                     city:"West Lafayette, IN",url:"purdue.edu",       tags:["Engineering","STEM","Public"],    type:"Public Research University" },
    { name:"Virginia Tech",                         city:"Blacksburg, VA",   url:"vt.edu",           tags:["Engineering","Public","STEM"],    type:"Public Research University" },
    { name:"Rose-Hulman Institute of Technology",   city:"Terre Haute, IN",  url:"rose-hulman.edu",  tags:["STEM","Engineering","Private"],   type:"Private Technical Institute" },
    { name:"Harvey Mudd College",                   city:"Claremont, CA",    url:"hmc.edu",          tags:["STEM","Liberal Arts","Private"],  type:"Private STEM College" },
    { name:"Rensselaer Polytechnic Institute",      city:"Troy, NY",         url:"rpi.edu",          tags:["Engineering","STEM","Private"],   type:"Private Research University" },
  ],

  "Liberal Arts Colleges": [
    { name:"Williams College",      city:"Williamstown, MA", url:"williams.edu",   tags:["Liberal Arts","#1 LAC","Private"],  type:"Private Liberal Arts College" },
    { name:"Amherst College",       city:"Amherst, MA",      url:"amherst.edu",    tags:["Liberal Arts","Private","T5 LAC"], type:"Private Liberal Arts College" },
    { name:"Swarthmore College",    city:"Swarthmore, PA",   url:"swarthmore.edu", tags:["Liberal Arts","Quaker","Private"],  type:"Private Liberal Arts College" },
    { name:"Pomona College",        city:"Claremont, CA",    url:"pomona.edu",     tags:["Liberal Arts","Claremont","Private"],type:"Private Liberal Arts College" },
    { name:"Wellesley College",     city:"Wellesley, MA",    url:"wellesley.edu",  tags:["Women's","Liberal Arts","Private"], type:"Private Women's College" },
    { name:"Vassar College",        city:"Poughkeepsie, NY", url:"vassar.edu",     tags:["Liberal Arts","Co-ed","Private"],   type:"Private Liberal Arts College" },
    { name:"Middlebury College",    city:"Middlebury, VT",   url:"middlebury.edu", tags:["Liberal Arts","Languages","Private"],type:"Private Liberal Arts College" },
    { name:"Bowdoin College",       city:"Brunswick, ME",    url:"bowdoin.edu",    tags:["Liberal Arts","Private","T10 LAC"], type:"Private Liberal Arts College" },
  ],

  "Large State Universities": [
    { name:"Ohio State University",      city:"Columbus, OH",         url:"osu.edu",      tags:["Public","Big Ten","Research"],        type:"Public Research University" },
    { name:"Penn State University",      city:"University Park, PA",  url:"psu.edu",      tags:["Public","Big Ten","Research"],        type:"Public Research University" },
    { name:"Michigan State University",  city:"East Lansing, MI",     url:"msu.edu",      tags:["Public","Big Ten","Agriculture"],     type:"Public Research University" },
    { name:"University of Georgia",      city:"Athens, GA",           url:"uga.edu",      tags:["Public","SEC","Research"],            type:"Public Research University" },
    { name:"Arizona State University",   city:"Tempe, AZ",            url:"asu.edu",      tags:["Public","Innovation","Large"],        type:"Public Research University" },
    { name:"Texas A&M University",       city:"College Station, TX",  url:"tamu.edu",     tags:["Public","Engineering","Military"],    type:"Public Research University" },
    { name:"University of Minnesota",    city:"Minneapolis, MN",      url:"umn.edu",      tags:["Public","Big Ten","Research"],        type:"Public Research University" },
    { name:"University of Washington",   city:"Seattle, WA",          url:"washington.edu",tags:["Public","Research","STEM"],         type:"Public Research University" },
  ],

  "Community Colleges": [
    { name:"Santa Monica College",          city:"Santa Monica, CA",   url:"smc.edu",        tags:["Community","Transfer","Affordable"], type:"Public Community College" },
    { name:"Miami Dade College",            city:"Miami, FL",          url:"mdc.edu",         tags:["Community","Large","Diverse"],       type:"Public Community College" },
    { name:"Houston Community College",     city:"Houston, TX",        url:"hccs.edu",        tags:["Community","CTE","Affordable"],      type:"Public Community College" },
    { name:"Pasadena City College",         city:"Pasadena, CA",       url:"pasadena.edu",    tags:["Community","Transfer","STEM"],       type:"Public Community College" },
    { name:"Northern Virginia Community College",city:"Annandale, VA", url:"nvcc.edu",        tags:["Community","Transfer","Affordable"], type:"Public Community College" },
    { name:"Austin Community College",      city:"Austin, TX",         url:"austincc.edu",    tags:["Community","CTE","Affordable"],      type:"Public Community College" },
  ]
};

const HS_DIR = {
  "Texas": [
    { name:"Westlake High School",       city:"Austin, TX",       url:"austinisd.org",    tags:["Public","Top Ranked","AP"],      type:"Public High School — Austin ISD" },
    { name:"Plano Senior High School",   city:"Plano, TX",        url:"pisd.edu",          tags:["Public","Large","AP"],           type:"Public High School — Plano ISD" },
    { name:"Lamar High School",          city:"Houston, TX",      url:"houstonisd.org",    tags:["Public","Magnet","Arts"],        type:"Public High School — Houston ISD" },
    { name:"Highland Park High School",  city:"Dallas, TX",       url:"hpisd.net",          tags:["Public","Top Ranked","Athletics"],type:"Public High School — HP ISD" },
    { name:"Northside Science Academy",  city:"San Antonio, TX",  url:"nisd.net",           tags:["Magnet","STEM","Public"],        type:"Magnet School — Northside ISD" },
    { name:"Allen High School",          city:"Allen, TX",        url:"allenisd.org",       tags:["Public","Large","Athletics"],    type:"Public High School — Allen ISD" },
  ],

  "California": [
    { name:"Whitney High School",          city:"Cerritos, CA",       url:"abcusd.org",    tags:["Public","Ranked #1 CA","STEM"],   type:"Public High School — ABC USD" },
    { name:"Lowell High School",           city:"San Francisco, CA",  url:"sfusd.edu",      tags:["Public","Selective","Competitive"],type:"Selective Public High School" },
    { name:"Beverly Hills High School",    city:"Beverly Hills, CA",  url:"bhusd.org",      tags:["Public","Arts","Athletics"],      type:"Public High School — BHUSD" },
    { name:"Granada Hills Charter",        city:"Granada Hills, CA",  url:"ghchs.com",      tags:["Charter","STEM","Large"],         type:"Charter High School" },
    { name:"Harvard-Westlake School",      city:"Los Angeles, CA",    url:"hw.com",          tags:["Private","College Prep","Top 10"],type:"Private Preparatory School" },
    { name:"Mira Costa High School",       city:"Manhattan Beach, CA",url:"mbusd.org",       tags:["Public","Athletics","AP"],        type:"Public High School" },
  ],

  "New York": [
    { name:"Stuyvesant High School",           city:"New York, NY",  url:"stuy.edu",              tags:["Specialized","Public","STEM","T1 NYC"],type:"NYC Specialized High School" },
    { name:"Bronx High School of Science",     city:"Bronx, NY",     url:"bxscience.edu",          tags:["Specialized","Science","Public"],       type:"NYC Specialized High School" },
    { name:"Brooklyn Technical High School",   city:"Brooklyn, NY",  url:"bths.edu",               tags:["Specialized","Engineering","Public"],    type:"NYC Specialized High School" },
    { name:"Regis High School",                city:"New York, NY",  url:"regis.org",              tags:["Private","Jesuit","Full Scholarship"],   type:"Private Catholic High School" },
    { name:"Jericho Senior High School",       city:"Jericho, NY",   url:"jerichoschools.org",     tags:["Public","Top Ranked","AP"],              type:"Public High School" },
  ],

  "Florida": [
    { name:"Buchholz High School",        city:"Gainesville, FL",   url:"sbac.edu",              tags:["Public","Magnet","IB"],           type:"Public IB World School" },
    { name:"Palm Beach Lakes High School",city:"West Palm Beach, FL",url:"palmbeachschools.org",  tags:["Public","Arts","CTE"],            type:"Public High School" },
    { name:"Coral Gables Senior High",    city:"Coral Gables, FL",  url:"dadeschools.net",        tags:["Public","IB","Bilingual"],        type:"Public IB High School — Miami-Dade" },
    { name:"Pine Crest School",           city:"Fort Lauderdale, FL",url:"pinecrest.edu",          tags:["Private","College Prep","AP"],    type:"Private Preparatory School" },
    { name:"Edgewater High School",       city:"Orlando, FL",       url:"ocps.net",               tags:["Public","Performing Arts","IB"],  type:"Public Performing Arts Magnet" },
  ],

  "Georgia": [
    { name:"Alpharetta High School",     city:"Alpharetta, GA",    url:"fultonschools.org",  tags:["Public","AP","Athletics"],         type:"Public High School — Fulton County" },
    { name:"Northview High School",      city:"Johns Creek, GA",   url:"fultonschools.org",  tags:["Public","STEM","Top Ranked"],      type:"Public High School — Fulton County" },
    { name:"The Westminster Schools",   city:"Atlanta, GA",       url:"westminster.net",    tags:["Private","College Prep","Top 10"], type:"Private Preparatory School" },
    { name:"Grady High School",         city:"Atlanta, GA",       url:"atlanta.k12.ga.us",  tags:["Public","IB","Urban"],             type:"Public IB High School — Atlanta PS" },
    { name:"Lambert High School",       city:"Suwanee, GA",       url:"forsyth.k12.ga.us",  tags:["Public","AP","Large"],             type:"Public High School — Forsyth County" },
  ],

  "Illinois": [
    { name:"New Trier High School",           city:"Winnetka, IL",  url:"newtrier.k12.il.us",  tags:["Public","Top Ranked","AP"],         type:"Public High School" },
    { name:"Jones College Prep",              city:"Chicago, IL",   url:"jonescollegeprep.org", tags:["Selective","Public","Chicago"],     type:"Chicago Selective Enrollment HS" },
    { name:"Northside College Preparatory",   city:"Chicago, IL",   url:"northsideprep.org",    tags:["Selective","Public","IB"],          type:"Chicago Selective Enrollment HS" },
    { name:"Lane Technical College Prep",     city:"Chicago, IL",   url:"lanetech.org",          tags:["Selective","STEM","Engineering"],   type:"Chicago Selective Enrollment HS" },
    { name:"Naperville Central High School",  city:"Naperville, IL",url:"naperville203.org",     tags:["Public","AP","Athletics"],          type:"Public High School" },
  ],

  "Top Private / Boarding Schools": [
    { name:"Phillips Exeter Academy",  city:"Exeter, NH",       url:"exeter.edu",    tags:["Boarding","Elite","Private"],   type:"Private Boarding School" },
    { name:"Phillips Academy Andover", city:"Andover, MA",      url:"andover.edu",   tags:["Boarding","Elite","Private"],   type:"Private Boarding School" },
    { name:"The Hotchkiss School",     city:"Lakeville, CT",    url:"hotchkiss.org", tags:["Boarding","Elite","Private"],   type:"Private Boarding School" },
    { name:"Choate Rosemary Hall",     city:"Wallingford, CT",  url:"choate.edu",    tags:["Boarding","Elite","Private"],   type:"Private Boarding School" },
    { name:"St. Paul's School",        city:"Concord, NH",      url:"sps.edu",       tags:["Boarding","Episcopal","Private"],type:"Private Boarding School" },
    { name:"The Lawrenceville School", city:"Lawrenceville, NJ",url:"lawrenceville.org",tags:["Boarding","Private","Elite"],type:"Private Boarding School" },
  ]
};
