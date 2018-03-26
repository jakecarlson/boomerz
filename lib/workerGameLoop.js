/*
Copyright 2011 Seth Ladd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

importScripts('../game/config.js');
importScripts('utils.js');
importScripts('box2dWeb-2.1.a.3.min.js');
importScripts('GameLoop.js');

//  Create the loop
var loop = new GameLoop(config);

//  Handle posts
self.onmessage = function(e) {
	switch (e.data.cmd) {
		case 'addDynamicBody':
			loop.addDynamicBody(e.data.options);
			break;
		case 'addStaticBody':
			loop.addStaticBody(e.data.options);
			break;
		case 'addKinematicBody':
			loop.addKinematicBody(e.data.options);
			break;
		case 'setCanvasSize':
			loop.setCanvasSize(e.data.width, e.data.height);
			break;
		case 'update':
			loop.update(e.data.x, e.data.y, e.data.state);
			break;
		case 'getBodyById':
			var body = loop.getBodyById(e.data.id);
			logger.log("test");
			postMessage({ cmd: 'setWorkerBody', "body": JSON.stringify(body) });
			break;
		case 'setInputState':
			loop.setInputState(e.data.active);
			break;
	}
};