import { Component, OnInit, ViewChild, ElementRef, HostListener, OnChanges, AfterViewChecked } from '@angular/core';
import * as THREE from 'three'
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit,AfterViewChecked {
  mouse: any;
  isblack: boolean=false;
  curbutton: number;
  chessman: any={};
  scale: number =1;
  ngAfterViewChecked(): void {
    console.log('check');
  }

  @ViewChild('container') container:ElementRef;
  camera:THREE.OrthographicCamera;
  scene:THREE.Scene;
  lines:THREE.LineSegments;
  points:THREE.Points;
  pointLight:THREE.PointLight;
  raycaster: THREE.Raycaster;
  renderer:THREE.WebGLRenderer;
  count =0;
  curmouse:any={};
  ButtonType = {
    Left: 0,
    Middle: 1,
    Right: 2
  };
  constructor() { }

  ngOnInit() {
    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight;
    this.camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, - 99999, 99999);
    // this.camera = new THREE.PerspectiveCamera( 60, width/height, 10, 1000 );
    this.camera.position.x = 0;
    this.camera.position.y = 0;
    this.camera.position.z = 60;
    this.camera.lookAt(new THREE.Vector3(0, 0, -1));

    this.scene = new THREE.Scene();

    var ambient = new THREE.AmbientLight(0x101010);
    this.scene.add(ambient);

    this.AddDirectionalLight();
   
    // Grid
    var size = 400, step = 40;
    var geometry = new THREE.Geometry();
    var pgeometry = new THREE.Geometry();
    for (var i = - size; i <= size; i += step) {
      geometry.vertices.push(new THREE.Vector3(- size, i, 0));
      geometry.vertices.push(new THREE.Vector3(size, i, 0));

      geometry.vertices.push(new THREE.Vector3(i, - size, 0));
      geometry.vertices.push(new THREE.Vector3(i, size, 0));

      for (var j = - size; j <= size; j += step) {
        pgeometry.vertices.push(new THREE.Vector3(i, j, 0));
      }
    }

    // var face = new THREE.Geometry();
    // face.vertices.push(new THREE.Vector3(-400, 400, -80));
    // face.vertices.push(new THREE.Vector3(-400, -400, -80));
    // face.vertices.push(new THREE.Vector3(400, -400, -80));
    // face.vertices.push(new THREE.Vector3(400, 400, -80));

    let material: any = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.5 });
    this.lines = new THREE.LineSegments(geometry, material);
    this.scene.add(this.lines);

    material = new THREE.PointsMaterial({ color: 0xffffff, size: 3, sizeAttenuation: false });
    this.points = new THREE.Points(pgeometry, material);
    this.scene.add(this.points);

    const planeGepmetry = new THREE.PlaneGeometry(800, 800, 20, 20);
    const planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
    const plane = new THREE.Mesh(planeGepmetry, planeMaterial);
    plane.position.set(0,0,-80);
    plane.receiveShadow = true;
    this.scene.add(plane);

    // const materialface = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.5 });
    // face.faces.push(new THREE.Face3(0,1,2));
    // face.faces.push(new THREE.Face3(2,3,0));
    // const facescene = new THREE.Mesh(face, [materialface,materialface]);
    // facescene.receiveShadow = true;
    // this.scene.add(facescene);

    // this.pointLight = new THREE.PointLight(0xffaa00);
    // this.pointLight.position.z = -200;
    // this.scene.add(this.pointLight);
    

    // renderer = new THREE.CanvasRenderer();
    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.shadowMap.enabled = true;
    this.renderer.setClearColor( 0xf0f0f0 ,0.5);
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.renderer.setSize( width, height);
    
    this.container.nativeElement.appendChild( this.renderer.domElement );

    //拾取
    this.raycaster = new THREE.Raycaster();
    this.raycaster.linePrecision=3;
    this.raycaster.params.Points.threshold=15;
    this.mouse = new THREE.Vector2();

    this.renderer.render(this.scene, this.camera);
  }

  //添加平行光
  AddDirectionalLight(){
    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.z = 100;
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.near = 2;
    directionalLight.shadow.camera.far = 1000;
    directionalLight.shadow.camera.left = -1000;
    directionalLight.shadow.camera.right = 1000;
    directionalLight.shadow.camera.top = 1000;
    directionalLight.shadow.camera.bottom = -1000;
    // 设置阴影的分辨率
    directionalLight.shadow.mapSize.width = 2000;
    directionalLight.shadow.mapSize.height = 2000;
    this.scene.add(directionalLight);
  }

  GetSize(){
    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight;
    return {width:width,height:height};
  }

  @HostListener("window:resize.out")
  resize() {
    // var size = this.GetSize();
    // this.camera.left = size.width / - 2;
    // this.camera.right = size.width / 2;
    // this.camera.top = size.height / 2;
    // this.camera.bottom = size.height / - 2;
    // this.camera.updateProjectionMatrix();
    // //camera = new THREE.OrthographicCamera( size.width / - 2, size.width / 2, size.height / 2, size.height / - 2, - 500, 1000 );
    // this.renderer.setSize(size.width, size.height);
    // this.renderer.render(this.scene, this.camera);
  }

  // @HostListener("window:mousewheel.out",["$event"])
  mousewheel(e:MouseWheelEvent) {
    e.stopPropagation();
    e.preventDefault();
    // e.preventDefault();
    if(e.wheelDelta<0) {
        this.camera.scale.multiplyScalar(1.1);
       // camera.zoom*=1.1;
        this.raycaster.linePrecision*=1.1;
        this.scale*=1.1;
     //   raycaster.params.Points.threshold*=1.1;
    }
    else{
        this.camera.scale.multiplyScalar(0.9);
      //  camera.zoom*=0.9;
        this.raycaster.linePrecision*=0.9;
        this.scale*=0.9;
      //  raycaster.params.Points.threshold*=0.9;
    }
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
  }

  GetObj(mouse: any, objs: THREE.Object3D): any {
    this.raycaster.setFromCamera(mouse, this.camera);
    const intersects = this.raycaster.intersectObject(objs);
    let INTERSECTED;
    if (intersects.length > 0) {
      if (INTERSECTED != intersects[0].index) {
        //attributes.size.array[ INTERSECTED ] = PARTICLE_SIZE;
        INTERSECTED = intersects[0].index;
        //attributes.size.array[ INTERSECTED ] = PARTICLE_SIZE * 1.25;
        //attributes.size.needsUpdate = true;
        //container.style.cursor = 'pointer';
      }
    } else if (INTERSECTED !== null) {
      //attributes.size.array[ INTERSECTED ] = PARTICLE_SIZE;
      //attributes.size.needsUpdate = true;
      INTERSECTED = null;
      //container.style.cursor = 'auto';
    }
    return INTERSECTED
  }

  mousedown(event:MouseWheelEvent) {
    event.stopPropagation();
    event.preventDefault();
    var size = this.GetSize();
        var box= this.container.nativeElement.getBoundingClientRect();
        this.curmouse.x=event.clientX;
        this.curmouse.y=event.clientY;
        if(event.button==this.ButtonType.Left) {
          this.mouse.x = ((event.clientX - box.left) / size.width ) * 2 - 1;
          this.mouse.y = -( (event.clientY - box.top) / size.height ) * 2 + 1;
          const index = this.GetObj(this.mouse, this.points);
            if (index !== null) {
                const vertor = (<THREE.Geometry>this.points.geometry).vertices[index];
               // CreateCircle(vertor);
                var x= Math.round( vertor.x/40);
                var y= Math.round( vertor.y/40);
                this.CreateSphere(vertor,x,y);
                this.renderer.render(this.scene, this.camera);
                if(this.isend(x,y)){
                    if(this.isblack) alert("白方赢！");
                    else  alert("黑方赢！");
                    for ( var i = this.scene.children.length-1; i >-1;i--) {
                        const object:any = this.scene.children[ i ];
                        if ( object.geometry instanceof THREE.SphereBufferGeometry ) this.scene.children.splice(i,1);
                    }
                    this.chessman={};
                    this.renderer.render(this.scene, this.camera);
                }
            }
        }
		this.curbutton=event.button;
  }

  mousemove(event:MouseWheelEvent) {
    event.stopPropagation();
    event.preventDefault();
    const size=this.GetSize();
        if(this.curbutton==this.ButtonType.Right){
            var v = new THREE.Vector3(event.clientY-this.curmouse.y,event.clientX-this.curmouse.x ,0);
            var angle= v.length()/200*Math.PI;
            // this.camera.rotateOnAxis(v.normalize(),angle);
            this.scene.rotateOnWorldAxis(v.normalize(),angle);
            this.curmouse.x=event.clientX;
            this.curmouse.y=event.clientY;
            this.renderer.render(this.scene, this.camera);
            return;
        }
        else if(this.curbutton==this.ButtonType.Middle){
            var v = new THREE.Vector3(event.clientX-this.curmouse.x,this.curmouse.y-event.clientY,0);
            var distance = - v.length()*this.scale;
            //camera.translateOnAxis(v.normalize(),distance);
            this.camera.translateOnAxis(v.normalize(),distance);
            this.curmouse.x=event.clientX;
            this.curmouse.y=event.clientY;
            this.renderer.render(this.scene, this.camera);
            return;
        }

        var box= this.container.nativeElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX-box.left)  /  size.width ) * 2 - 1;
        this.mouse.y = - ( (event.clientY-box.top) / size.height ) * 2 + 1;
        var index =  this.GetObj(this.mouse,this.lines);
        if(index!==null) {
          this.container.nativeElement.style.cursor = 'pointer';
        }
        else
          this.container.nativeElement.style.cursor = 'auto';
  }

  mouseup(event:MouseWheelEvent) {
    event.stopPropagation();
    event.preventDefault();
    this.curbutton=null;
  }

  isend(x: number, y: number): any {
    var isblack=this.chessman[x+''+y];
        let count=1;
        count=this.getcount(x+1,y,isblack,count,1,0);
        count=this.getcount(x-1,y,isblack,count,-1,0);
        if(count==5) return true;
        count=1;
        count=this.getcount(x,y+1,isblack,count,0,1);
        count=this.getcount(x,y-1,isblack,count,0,-1);
        if(count==5) return true;
        count=1;
        count=this.getcount(x+1,y+1,isblack,count,1,1);
        count=this.getcount(x-1,y-1,isblack,count,-1,-1);
        if(count==5) return true;
        count=1;
        count=this.getcount(x+1,y-1,isblack,count,1,-1);
        count=this.getcount(x-1,y+1,isblack,count,-1,1);
        if(count==5) return true;
  }
  getcount(x: number, y: number, isblack: any, count: number, vx: number, vy: number): number {
    while (this.chessman.hasOwnProperty(x + '' + y)) {
      if (this.chessman[x + '' + y] == isblack) {
        x = x + vx;
        y = y + vy;
        count++;
      }
      else {
        break;
      }
    }
    return count;
  }

  CreateSphere(v: THREE.Vector3, x: number, y: number): any {
    if(this.chessman.hasOwnProperty(x+''+y)) return;
    this.chessman[x+''+y]=this.isblack;

        var material =new THREE.MeshPhongMaterial({
            color: new THREE.Color( 0,0,0  ),
            specular:new THREE.Color( 0.1,0.1,0.1 ),
            shininess:30
        });
        // var material = new THREE.MeshStandardMaterial({color:0x7777ff});
        if(!this.isblack) material.color=new THREE.Color(  0.7,0.7,0.7  );
        this.isblack=!this.isblack;
        var radius = 12;
        var segments = 32; //<-- Increase or decrease for more resolution I guess
        var circleGeometry = new THREE.SphereBufferGeometry( radius, segments, segments );
        var m1 = new THREE.Matrix4();
        m1.lookAt(new THREE.Vector3(   0,0 ,0),new THREE.Vector3(   0,0 ,-1),new THREE.Vector3(   0, 1 ,0));
        m1.setPosition(v);
        circleGeometry.applyMatrix(m1);
        var circle = new THREE.Mesh( circleGeometry, material );
        circle.castShadow = true;
        this.scene.add( circle );
  }

}
