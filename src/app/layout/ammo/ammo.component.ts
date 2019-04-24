import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import * as THREE from 'src/app/lib';
import { LightConfig } from 'src/app/lib/config';
import { ThreeBSP } from 'src/app/lib/threebsp';

@Component({
  selector: 'app-ammo',
  templateUrl: './ammo.component.html',
  styleUrls: ['./ammo.component.scss']
})
export class AmmoComponent implements OnInit {

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

    //几何体对象
    var cylinder = new THREE.CylinderGeometry(50,50,40,40);//圆柱
    var cylinder2 = new THREE.SphereGeometry(10,40,40);//圆柱
    cylinder2.translate(20,10,0)
    var box = new THREE.BoxGeometry(40,50,40);//立方体
    var box2 = new THREE.SphereGeometry(30,50,50);//立方体
    box2.translate(0,40,0)
    //材质对象
    var material=new THREE.MeshPhongMaterial({color:0x0000ff});
    //网格模型对象
    var cylinderMesh=new THREE.Mesh(cylinder,material);//圆柱
    var cylinderMesh2=new THREE.Mesh(cylinder2,material);//圆柱
    var boxMesh=new THREE.Mesh(box,material);//立方体
    var boxMesh2=new THREE.Mesh(box2,material);//立方体
    //包装成ThreeBSP对象
    var cylinderBSP = new ThreeBSP(cylinderMesh);
    var cylinderBSP2 = new ThreeBSP(cylinderMesh2);
    var boxBSP = new ThreeBSP(boxMesh);
    var boxBSP2 = new ThreeBSP(boxMesh2);
    var result = cylinderBSP.subtract(boxBSP);
    result = result.union(cylinderBSP2);
    result = result.subtract(boxBSP2);


    //ThreeBSP对象转化为网格模型对象
    var mesh = result.toMesh();
    this.scene.add(mesh);//网格模型添加到场景中

    this.container.nativeElement.appendChild(this.renderer.domElement);
    this.animate();
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
