var gradient = '45-#eeeeee-#ffffff',
	stroke = 'red',
	strokeWidth = 1,
	strokeLineJoin = 'round',
	opacity = 0;

//ENGINE (Dont Touch Below!!!)
function getPaper(id,img,x,y,width,height){
	var el = document.getElementById(id), paper = Raphael(el,width,height);
	paper.image(img,x,y,width,height);
	return paper;
}

function createShape(paper,shape,coords){
	var area, coords = coords.split(','), path = new Array();
	switch(shape){
		case 'rect': area = paper.rect(coords[0],coords[1],coords[2],coords[3]); break;
		case 'poly':
			path.push('M '+coords[0]+' '+coords[1]);
			for(var i=2,l=coords.length; i < l; i=i+2){path.push('l '+(coords[i]-coords[i-2]));path.push((coords[i+1]-coords[i-1]));}
			path.push('z');
			area = paper.path(path.join(' '));
		break;
	}
	area.mouseup(function(event){if(typeof eventMouseUp=='function'){eventMouseUp(this,event);}});
	area.mousedown(function(event){if(typeof eventMouseDown=='function'){eventMouseDown(this,event);}});
	area.mouseover(function(event){if(typeof eventMouseHover=='function'){eventMouseHover(this,event);}});
	area.dblclick(function(event){if(typeof eventMouseDoubleClick=='function'){eventMouseDoubleClick(this,event);}});
	area.mouseout(function(event){if(typeof eventMouseOut=='function'){eventMouseOut(this,event);}});
	area.mousemove(function(event){if(typeof eventMouseMove=='function'){eventMouseMove(this,event);}});
	area.click(function(event){if(typeof eventMouseClick=='function'){eventMouseClick(this,event);}});
	area.dblclick(function(event){if(typeof eventMouseDoubleClick=='function'){eventMouseDoubleClick(this,event);}});
	return area;
}
