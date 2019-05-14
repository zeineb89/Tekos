var express = require('express');
var router = express.Router();
router.use(express.json());

const Joi = require('@hapi/joi');

var characteristics = []
const schema = Joi.object().keys({
    name: Joi.string().required(),
    tables: Joi.array().items(Joi.object({
	    data: Joi.string().required(),
	    name: Joi.string().required(),
	    columnHeaders: Joi.array().items(Joi.object({
		    name: Joi.string().required(),
		    dataType: Joi.string().required(),
	    }))
	})),
	metrics: Joi.array().items(Joi.object({
	    name: Joi.string().required(),
	    dataType: Joi.string().required(),
	    expressions: Joi.array().items(Joi.object({
		    formula: Joi.alternatives(
		        Joi.string(),
		        Joi.number()
		    ).required()
	    }))
	})),
	attributes: Joi.array().items(Joi.object({
	    name: Joi.string(),
	    attributeForms: Joi.array().items(Joi.object({
		    category: Joi.string(),
		    expressions: Joi.array().items(Joi.object({
			    formula:  Joi.alternatives(
		        Joi.string(),
		        Joi.number()
		    ).required(),
		    })),
		    dataType:Joi.string(),
	    }))
	})).options({ stripUnknown: true })
})

const schema2 = Joi.object().keys({
    name: Joi.string().required(),
    description: Joi.string().required(),
	properties: Joi.object({}).options({ stripUnknown: true }),
})

const schema3 = Joi.object().keys({
    data: Joi.string().required(),
    company: Joi.string().required(),
    sensor: Joi.string().required(),
	Datatype: Joi.string().required(),
	value: Joi.string().required(),
})

const schema4 = Joi.object().keys({
    data : Joi.object().keys({
	    type: Joi.string().required(),
	    proprety: Joi.string().required(),
	    value: Joi.number().required()
	})
})


const schemas = {s1: schema, s2: schema2, s3: schema3, s4:schema4}

const listFunction = {
	s1: fn1 = (data , callback) => {
		characteristics = [];
		console.log('fn1 executed')
		for (var i = 0; i < data.metrics.length; i++) {
			characteristics.push(data.metrics[i].name)
		}
		// console.log(characteristics)
		callback(characteristics)
	},
	s2: fn2 = (data, callback) => {
		console.log('fn2 executed')
		characteristics = [];
		var keysProp = Object.keys(data.properties)
		for(obj in keysProp){
			let prop = keysProp[obj]
			let propDetails = data.properties[prop]
			characteristics.push(propDetails.title)
		}
		// console.log(characteristics)
		callback(characteristics)
	},
	s3: fn3 = (data, callback) => {
		console.log('fn2 executed')
		characteristics = [];
		characteristics.push(data.Datatype)
		console.log(characteristics)
		callback(characteristics)
	},
	s4: fn4 = (data, callback) => {
		console.log('fn4 executed')
		characteristics.push(data.data.proprety)
		console.log(characteristics)
		callback(characteristics)
	},
}

const sendTelemtry = (input) = {
	s1: fn1 = (data, input, callback) => {
		characteristics = [];
		console.log('sendTelemtry fn1 executed')
		for (var i = 0; i < data.metrics.length; i++) {
			if(data.metrics[i].name === input){
				callback(data.metrics[i].expressions[0].formula)
			}
		}
		// console.log(characteristics)

	},
	s2: fn2 = (data, input, callback) => {
		console.log('sendTelemtry fn2 executed')
		characteristics = [];
		var keysProp = Object.keys(data.properties)
		for(obj in keysProp){
			let prop = keysProp[obj]
			let propDetails = data.properties[prop]
			if(propDetails.title === input)
				callback(propDetails.value)
		}
		// console.log(characteristics)
	},
	s3: fn3 = (data, input, callback) => {
		console.log('sendTelemtry fn3 executed')
		callback(data.value)
	},
	s4: fn4 = (data, input, callback) => {
		console.log('sendTelemtry fn4 executed')
		callback(data.data.value)
	},
}

var expl2 ={
  "name":"On/Off Switch",
  "description": "A web connected switch",
  "properties": {
    "on": {
      "title": "On/Off",
      "type": "boolean",
      "description": "Whether the lamp is turned on",
      "links": [{"href": "/things/lamp/properties/on"}],
      "value": 'on'
    },
     "brightness" : {
      "@type": "BrightnessProperty",
      "type": "integer",
      "title": "Brightness",
      "description": "The level of light from 0-100",
      "minimum" : 0,
      "maximum" : 100,
      "links": [{"href": "/things/lamp/properties/brightness"}],
      "value": 50
    }
  }
}

var explr = {
		"name":"MapsIOT3",
		"tables":[
			{
				"data":"e30=",
				"name":"MAPS_TABLE",
				"columnHeaders":[
					{"name":"ID_Point","dataType":"DOUBLE"},
					{"name":"temperature","dataType":"DOUBLE"},
					{"name":"humidity","dataType":"DOUBLE"}
				]
			}
		],
		"metrics":[
			{
				"name":"temperature",
				"dataType":"number",
				"expressions":[
					{
						"formula":30,
					}
				]
			},
			{
				"name":"humidity",
				"dataType":"number",
				"expressions":[
					{
						"formula":60,
					}
				]
			}
		],
		"attributes":[
			{
				"name":"ID_Point",
				"attributeForms":[
					{
						"category":"ID",
						"expressions":[
							{
								"formula":"MAPS_TABLE.ID_Point",
								"temperature": 40
							}
						],
						"dataType":"string"
					}
				]
			}
		]
}

var expl3 = {"IDkey":"ESP-1","sensors":{"1":{"type":"humidity","value":0},"2":{"type":"temperature","value":0}}}

var device = expl2

var shemas  = [schema,schema2, schema3, schema4]
var index = -1
function ValidateSchema(deviceData, callback){
	for (var i = 0; i < shemas.length; i++) {
		let s = shemas[i]
		console.log('deviceData')
		console.log(deviceData)
		Joi.validate(deviceData, s, function (err, s) {
			if(err === null)
				{
					index = i
					return;
				}
			else if(index === -1 && i === shemas.length-1 ){
				console.log('model nn compatible')
				callback({error: true, message:"no schema compatible"})
			}
		});
	}
	if(index>-1){
		var keys = Object.keys(schemas)
		listFunction[keys[index]](deviceData, data =>{
			callback({success: true, data:data})
		})

	}
}

var j =-1;
function sendTelemetry(deviceData, input, callback){
	for (var i = 0; i < shemas.length; i++) {
		let s = shemas[i]
		
		console.log(deviceData)
		console.log(input)
		Joi.validate(deviceData, s, function (err, s) {
			if(err === null)
				{
					j = i
					console.log(j)
					return;
				}
			else if(j === -1 && i === shemas.length-1 ){
				console.log('model nn compatible')
				callback({error: true, message:"no schema compatible"})
			}
		});
	}
	if(j>-1){
		var keys = Object.keys(schemas)
		sendTelemtry[keys[j]](deviceData,input, value =>{
			callback({success: true, data:value})
		})

	}
}
router.post('/signin', function(req, res, next) {
	//here you get the data send from client
	let data = req.body 

	
	// implement the function to find the user in the Data base	
	
	res.sen({success : true, user : user})
}); 

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('hello !');
});

router.post('/ValidateSchema', function(req, res, next) {
  // res.render('index', { title: 'Express' });
	let data = req.body
	// console.log(data)
	ValidateSchema(data, deviceData =>{
		console.log("deviceData")
		console.log(deviceData)
  		res.send(deviceData);	
	})
}); 

router.post("/acceptCredentialsWifi", function(req, res, next) {
  // res.render('index', { title: 'Express' });
	let data = req.body
	console.log(data)
	res.send({success:true});
}); 

router.get("/sendJson", function(req, res, next) {
  // res.render('index', { title: 'Express' });
	console.log("send data service")	
	// console.log(expl2)
	res.send({success:true, data: explr });
}); 

router.post("/sendTelemetry", function(req, res, next) {
  // res.render('index', { title: 'Express' });
	console.log("send sendTelemetry")	
	let data = req.body.data
	let input = req.body.input
	console.log(data)	
	console.log(input)	

	sendTelemetry(data,input, value => {
		console.log(value)
		res.send(value);
	})

	// res.send({success:true, data: explr });
}); 


// app.post('/ValidateSchema', function (req, res){
// })
module.exports = router;
