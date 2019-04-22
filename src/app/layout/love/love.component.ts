import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, NgZone, HostListener } from '@angular/core';
import * as THREE from 'src/app/lib';
import { LightConfig } from 'src/app/lib/config';

@Component({
  selector: 'app-love',
  templateUrl: './love.component.html',
  styleUrls: ['./love.component.scss']
})
export class LoveComponent implements OnInit {

  mouse = new THREE.Vector2();
  curbutton: number;
  scale: number = 1;
  font: THREE.Font;
  @ViewChild('container') container: ElementRef;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  pointLight: THREE.PointLight;
  raycaster: THREE.Raycaster;
  renderer: THREE.WebGLRenderer;
  eventmove: any;
  eventmouseup: any;
  count = 0;
  curmouse: any = {};
  ButtonType = {
    Left: 0,
    Middle: 1,
    Right: 2
  };
  constructor(private zone: NgZone) {

  }

  ngOnInit() {
    this.zone.runOutsideAngular(() => {
      this.Init();
    });
  }

  Init() {
    // var getfront = this.GetText('/assets/fonts/helvetiker_regular.typeface.json');

    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight;

    //渲染器
    // renderer = new THREE.CanvasRenderer();
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.setClearColor(0xf0f0f0, 0.5);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(width, height);

    //拾取
    this.raycaster = new THREE.Raycaster();
    this.raycaster.linePrecision = 3;
    this.raycaster.params.Points.threshold = 5;

    //场景
    this.scene = new THREE.Scene();

    //相机
    // this.camera = new THREE.OrthographicCamera(width / - 2, width / 2, height / 2, height / - 2, - 99999, 99999);
    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 10000);
    this.camera.position.set(0, 0, 480);
    this.camera.lookAt(new THREE.Vector3(0, 0, -1));

    //光
    var ambient = new THREE.AmbientLight(0x101010);
    this.scene.add(ambient);

    LightConfig.AddDirectionalLight(this.scene);

    //
    this.AddTexture();
    this.AddPlane();

    this.container.nativeElement.appendChild(this.renderer.domElement);
    this.animate();
  }

  //添加纹理面
  async AddTexture() {
    var geometry = new THREE.CircleGeometry( 50, 12 );
    console.log(geometry);

    const texture = await this.GetTexture('/assets/textures/logo.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    // texture.repeat.set(2.5, 2.5);
    const materialface = new THREE.MeshBasicMaterial({ map: texture, color: 0xffffff,side:THREE.DoubleSide });
    const facescene = new THREE.Mesh(geometry, materialface);
    facescene.receiveShadow = true;
    facescene.castShadow = true;
    this.scene.add(facescene);
  }

  //添加边面
  async AddPlane() {
    var geometry = new THREE.CircleGeometry( 45, 12 );
    geometry.vertices.push(geometry.vertices[1]);
    for(var i=1;i<geometry.vertices.length-1;i++){
      var v0 = geometry.vertices[i].clone().setZ(-50);
      var v1 = geometry.vertices[i+1].clone().setZ(-50);
      var v2 = geometry.vertices[i+1].clone();
      var v3 = geometry.vertices[i].clone();
      this.AddPrivatePlane(v1,v0,v3,v2)
    }
  }

  async AddPrivatePlane(v0:THREE.Vector3,v1:THREE.Vector3,v2:THREE.Vector3,v3:THREE.Vector3){
     var nv = new THREE.Vector3().crossVectors(v1.clone().sub(v0),v3.clone().sub(v0)).normalize();
     var m = new THREE.Matrix4();
     var x = new THREE.Vector3().subVectors(v1,v0).normalize();
     var y = new THREE.Vector3().subVectors(v2,v1).normalize();
     m.elements = [x.x,x.y,x.z,0,
        y.x,y.y,y.z,0,
        nv.x,nv.y,nv.z,0,
        v0.x,v0.y,v0.z,1];
    // m.setPosition(v0);
    // m.lookAt(new THREE.Vector3().addVectors(nv,v0),v0,new THREE.Vector3().subVectors(v3,v0))
     const width = v0.clone().sub(v1).length();
     const height = v2.clone().sub(v1).length();
     
    // var face = new THREE.Geometry();
    // face.name = "0";
    // face.vertices.push(v1,v0,v3,v2);
    // face.faces.push(new THREE.Face3(0,1,2,nv));
    // face.faces.push(new THREE.Face3(2,3,0,nv));
    // face.faceVertexUvs[0].push([new THREE.Vector2(0, 0), new THREE.Vector2(1, 0), new THREE.Vector2(1, 1)]
    //   , [new THREE.Vector2(1, 1), new THREE.Vector2(0, 1), new THREE.Vector2(0, 0)]);

      var face = new THREE.BufferGeometry();
      const vertices: number[] = [];//点集
      vertices.push(0,0,0,width,0,0,width,height,0,0,height,0);
      // vertices.push(0,0,-height,0,width,-height,0,width,0,0,0,0);
      // vertices.push(v0.x, v0.y, v0.z,v1.x, v1.y, v1.z);
      // vertices.push(v2.x, v2.y, v2.z,v3.x, v3.y, v3.z);
      const indexs: number[] = []; indexs.push(0, 1, 2, 2, 3, 0);//点索引
      // const normals: number[] = [nv.x, nv.y, nv.z, nv.x, nv.y, nv.z, nv.x, nv.y, nv.z, nv.x, nv.y, nv.z];//法向
      const normals: number[] = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];//法向
      const uvs: number[] = [ 0, 0, 1, 0, 1, 1,0, 1];//纹理
      face.setIndex(indexs);
      face.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      face.addAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
      face.addAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

      // face.applyMatrix(m);

    const texture = await this.GetTexture('/assets/textures/logo.jpg');
    const materialface = new THREE.MeshBasicMaterial({ map: texture, color: 0xffffff ,side:THREE.DoubleSide});
    const facescene = new THREE.Mesh(face, materialface);
    facescene.name="0";
    facescene.receiveShadow = true;
    facescene.castShadow = true;
    facescene.applyMatrix(m);
    facescene.userData.step = 0;
    this.scene.add(facescene);
  }

  //加载纹理
  GetTexture(url): Promise<THREE.Texture> {
    return new Promise((reslove, reject) => {
      new THREE.TextureLoader().load(url, texture => {
        reslove(texture)
      }, null, (err) => {
        reject(err);
      })
    });
  }

  //字体
  GetText(url): Promise<THREE.Font> {
    return new Promise((reslove, reject) => {
      new THREE.FontLoader().load(url, font => {
        reslove(font)
      }, null, (err) => {
        reject(err);
      })
    });
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.animateFace();
    this.renderer.render(this.scene, this.camera);
  }

  setp = -Math.PI/2/50;
  x = new THREE.Vector3(1,0,0);
  animateFace() {
    for (var i = this.scene.children.length - 1; i > -1; i--) {
      const object = <THREE.Mesh>this.scene.children[i];
      if (object.name==="0") {
        if(object.userData.step<-Math.PI/2&&this.setp<0) this.setp = -this.setp;
        else if(object.userData.step>0&&this.setp>0) this.setp = -this.setp;
        object.rotateX(this.setp);
        object.userData.step+=this.setp;
      }
    }
  }

  contextmenu(e: MouseEvent) {
    e.cancelBubble = true
    e.returnValue = false;
    return false;
  }

  mousewheel(e: MouseWheelEvent) {
    e.stopPropagation();
    e.preventDefault();
    // e.preventDefault();
    if (e.wheelDelta > 0) {
      // this.camera.scale.multiplyScalar(1.1);
      this.scene.scale.multiplyScalar(1.1);
      // camera.zoom*=1.1;
      this.raycaster.linePrecision *= 1.1;
      this.scale *= 1.1;
      //   raycaster.params.Points.threshold*=1.1;
    }
    else {
      // this.camera.scale.multiplyScalar(0.9);
      this.scene.scale.multiplyScalar(0.9);
      //  camera.zoom*=0.9;
      this.raycaster.linePrecision *= 0.9;
      this.scale *= 0.9;
      //  raycaster.params.Points.threshold*=0.9;
    }
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
  }

  GetObj(mouse: any, objs: THREE.Object3D): any {
    if (!this.raycaster) return;
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

  GetSize() {
    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight;
    return { width: width, height: height };
  }

  mousedown(event: MouseWheelEvent) {
    event.stopPropagation();
    event.preventDefault();
    var size = this.GetSize();
    var box = this.container.nativeElement.getBoundingClientRect();
    this.curmouse.x = event.clientX;
    this.curmouse.y = event.clientY;
    this.curbutton = event.button;
    // this.eventmove = (e)=>this.mousemove(e);
    // this.container.nativeElement.addEventListener("mousemove",this.eventmove);
    this.eventmouseup = (e) => this.mouseup(e);
    document.addEventListener("mouseup", this.eventmouseup);
  }

  mousemove(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    const size = this.GetSize();
    if (this.curbutton == this.ButtonType.Right) {
      var v = new THREE.Vector3(event.clientY - this.curmouse.y, event.clientX - this.curmouse.x, 0);
      var angle = v.length() / 200 * Math.PI;
      // this.camera.rotateOnAxis(v.normalize(), angle);
      this.scene.rotateOnWorldAxis(v.normalize(), angle);

      this.curmouse.x = event.clientX;
      this.curmouse.y = event.clientY;
      return false;
    }
    else if (this.curbutton == this.ButtonType.Middle) {
      var v = new THREE.Vector3(event.clientX - this.curmouse.x, this.curmouse.y - event.clientY, 0);
      var distance = - v.length() * this.scale;
      //camera.translateOnAxis(v.normalize(),distance);
      this.camera.translateOnAxis(v.normalize(), distance);
      this.curmouse.x = event.clientX;
      this.curmouse.y = event.clientY;
      return;
    }

  }

  mouseup(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    event.returnValue = false;
    this.curbutton = null;
    // if(this.eventmove){
    //   this.container.nativeElement.removeEventListener("mousemove",this.eventmove);
    //   this.eventmove = null;
    // }
    if (this.eventmouseup) {
      document.removeEventListener("mouseup", this.eventmouseup);
      this.eventmouseup = null;
    }
    return false;
  }
}
