import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked, NgZone, HostListener, OnDestroy } from '@angular/core';
// import * as THREE from 'three'
import * as THREE from 'src/app/lib';
import { LightConfig } from 'src/app/lib/config';
// import  '../../../../../node_modules/physijs-browserify/physijs'
// window["Physijs"] = require('physijs-browserify')(THREE);
// Physijs.scripts.worker = '/assets/libs/physi-worker.js';
// Physijs.scripts.ammo = '/assets/libs/ammo.js';
// import Reflector from 'src/app/lib/Reflector';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: []
})
export class HomeComponent implements OnInit, OnDestroy {

  mouse = new THREE.Vector2();
  isblack: boolean = false;
  curbutton: number;
  chessman: any = {};
  scale: number = 1;
  font: THREE.Font;

  @ViewChild('container') container: ElementRef;
  camera: THREE.PerspectiveCamera;
  scene: THREE.Scene;
  lines: THREE.LineSegments;
  points: THREE.Points;
  pointLight: THREE.PointLight;
  raycaster: THREE.Raycaster;
  renderer: THREE.WebGLRenderer;
  xyz: THREE.XYZ;
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

  async Init() {
    var getfront = this.GetText('/assets/fonts/helvetiker_regular.typeface.json');

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

    let material: any = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.5 });
    this.lines = new THREE.LineSegments(geometry, material);
    this.scene.add(this.lines);

    material = new THREE.PointsMaterial({ color: 0xffffff, size: 3, sizeAttenuation: false });
    this.points = new THREE.Points(pgeometry, material);
    this.scene.add(this.points);

    // const planeGepmetry = new THREE.PlaneGeometry(800, 800, 20, 20);
    // const planeMaterial = new THREE.MeshLambertMaterial({color: 0xffffff});
    // const plane = new THREE.Mesh(planeGepmetry, planeMaterial);
    // plane.position.set(0,0,-80);
    // plane.receiveShadow = true;
    // this.scene.add(plane);
    // this.AddPlane();

    await this.AddTexture();

    // this.AddMirror();

    this.pointLight = new THREE.PointLight(0xffaa00);
    this.pointLight.position.z = -200;
    // this.scene.add(this.pointLight);

    this.container.nativeElement.appendChild(this.renderer.domElement);


    //坐标系模型
    this.font = await getfront;
    this.xyz = new THREE.XYZ(width, height, this.font);

    this.animate();
  }



  //添加平面
  AddPlane() {
    var face = new THREE.BufferGeometry();
    let vertices: number[] = [];
    vertices.push(-400, 400, -80);
    vertices.push(-400, -400, -80);
    vertices.push(400, -400, -80);
    vertices.push(400, 400, -80);
    const normals: number[] = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
    const indexs: number[] = []; indexs.push(0, 1, 2, 2, 3, 0)
    face.setIndex(indexs);
    face.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    face.addAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    const materialface = new THREE.MeshLambertMaterial({ color: 0xffffff });
    const facescene = new THREE.Mesh(face, materialface);
    facescene.receiveShadow = true;
    this.scene.add(facescene);
  }

  //添加纹理面
  async AddTexture() {
    var face = new THREE.BufferGeometry();
    const vertices: number[] = [];//点集
    vertices.push(-400, 400, -80);
    vertices.push(-400, -400, -80);
    vertices.push(400, -400, -80);
    vertices.push(400, 400, -80);
    const indexs: number[] = []; indexs.push(0, 1, 2, 2, 3, 0);//点索引
    const normals: number[] = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];//法向
    const uvs: number[] = [0, 1, 0, 0, 1, 0, 1, 1];//纹理
    face.setIndex(indexs);
    face.addAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    face.addAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    face.addAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    const texture = await this.GetTexture('/assets/textures/logo.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2.5, 2.5);
    const materialface = new THREE.MeshPhongMaterial({ map: texture, color: 0xffffff });
    const facescene = new THREE.Mesh(face, materialface);
    facescene.receiveShadow = true;
    this.scene.add(facescene);
  }

  //添加镜面反射
  AddMirror() {
    // var face = new THREE.BufferGeometry();
    // const vertices:number[] =[];//点集
    // vertices.push(-400, 400, -80);
    // vertices.push(-400, -400, -80);
    // vertices.push(400, -400, -80);
    // vertices.push(400, 400, -80);
    // const indexs:number[] =[];indexs.push(0,1,2,2,3,0);//点索引
    // const normals:number[] =[0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];//法向
    // // const uvs:number[] =[0,1,0,0,1,0,1,1];//纹理
    // face.setIndex(indexs);
    // face.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
    // face.addAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ) );
    // // face.addAttribute( 'uv', new THREE.Float32BufferAttribute( uvs, 2 ) );

    // var radius = 400;
    // var segments = 32; //<-- Increase or decrease for more resolution I guess
    // var face = new THREE.SphereBufferGeometry( radius, segments, segments );
    // face.translate(0,0,-480);

    const face = new THREE.PlaneGeometry(800, 800, 20, 20);
    face.translate(0, 0, -80);
    let options = {
      clipBias: 1,
      textureWidth: 800 * window.devicePixelRatio,
      textureHeight: 800 * window.devicePixelRatio,
      color: 0x889999,
      // recursion: 1
    };
    const facescene = new THREE.Reflector(face, options);
    // facescene.receiveShadow = true;
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

  GetSize() {
    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight;
    return { width: width, height: height };
  }

  @HostListener("window:resize.out")
  resize() {
    var size = this.GetSize();
    // this.camera.left = size.width / - 2;
    // this.camera.right = size.width / 2;
    // this.camera.top = size.height / 2;
    // this.camera.bottom = size.height / - 2;
    // this.camera.updateProjectionMatrix();
    //camera = new THREE.OrthographicCamera( size.width / - 2, size.width / 2, size.height / 2, size.height / - 2, - 500, 1000 );
    // var v = this.renderer.getViewport();

    this.camera.aspect = size.width / size.height;
    this.camera.updateProjectionMatrix();
    this.xyz.init(size.width,size.height);
    this.renderer.setSize(size.width, size.height);
  }

  // @HostListener("window:mousewheel.out",["$event"])
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

  mousedown(event: MouseWheelEvent) {
    event.stopPropagation();
    event.preventDefault();
    var size = this.GetSize();
    var box = this.container.nativeElement.getBoundingClientRect();
    this.curmouse.x = event.clientX;
    this.curmouse.y = event.clientY;
    if (event.button == this.ButtonType.Left) {
      this.mouse.x = ((event.clientX - box.left) / size.width) * 2 - 1;
      this.mouse.y = -((event.clientY - box.top) / size.height) * 2 + 1;
      const index = this.GetObj(this.mouse, this.points);
      if (index !== null) {
        const vertor = (<THREE.Geometry>this.points.geometry).vertices[index];
        // CreateCircle(vertor);
        var x = Math.round(vertor.x / 40);
        var y = Math.round(vertor.y / 40);
        this.CreateSphere(vertor, x, y);
        // this.renderer.render(this.scene, this.camera);
        if (this.isend(x, y)) {
          if (this.isblack) alert("白方赢！");
          else alert("黑方赢！");
          for (var i = this.scene.children.length - 1; i > -1; i--) {
            const object: any = this.scene.children[i];
            if (object.geometry instanceof THREE.SphereBufferGeometry) this.scene.children.splice(i, 1);
          }
          this.chessman = {};
          // this.renderer.render(this.scene, this.camera);
        }
      }
    }
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

      var q = this.scene.quaternion.clone();
      this.xyz.setRotationFromQuaternion(q);

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
    else {
      var box = this.container.nativeElement.getBoundingClientRect();
      this.mouse.x = ((event.clientX - box.left) / size.width) * 2 - 1;
      this.mouse.y = - ((event.clientY - box.top) / size.height) * 2 + 1;
      var index = this.GetObj(this.mouse, this.points);
      const dom: any = event.target;
      if (index !== null) {
        dom.style.cursor = 'pointer';
      }
      else
        dom.style.cursor = 'auto';
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

  isend(x: number, y: number): any {
    var isblack = this.chessman[x + '' + y];
    let count = 1;
    count = this.getcount(x + 1, y, isblack, count, 1, 0);
    count = this.getcount(x - 1, y, isblack, count, -1, 0);
    if (count == 5) return true;
    count = 1;
    count = this.getcount(x, y + 1, isblack, count, 0, 1);
    count = this.getcount(x, y - 1, isblack, count, 0, -1);
    if (count == 5) return true;
    count = 1;
    count = this.getcount(x + 1, y + 1, isblack, count, 1, 1);
    count = this.getcount(x - 1, y - 1, isblack, count, -1, -1);
    if (count == 5) return true;
    count = 1;
    count = this.getcount(x + 1, y - 1, isblack, count, 1, -1);
    count = this.getcount(x - 1, y + 1, isblack, count, -1, 1);
    if (count == 5) return true;
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
    if (this.chessman.hasOwnProperty(x + '' + y)) return;
    this.chessman[x + '' + y] = this.isblack;

    var material = new THREE.MeshPhongMaterial({
      color: new THREE.Color(0, 0, 0),
      specular: new THREE.Color(0.1, 0.1, 0.1),
      shininess: 30
    });
    material.morphTargets = true;
    // var material = new THREE.MeshStandardMaterial({color:0x7777ff});
    if (!this.isblack) material.color = new THREE.Color(0.7, 0.7, 0.7);
    this.isblack = !this.isblack;
    var radius = 12;
    var segments = 32; //<-- Increase or decrease for more resolution I guess
    var circleGeometry = new THREE.SphereBufferGeometry(radius, segments, segments);
    var cubeTarget1 = new THREE.SphereBufferGeometry(6, segments, segments);
    circleGeometry.morphAttributes.position = [];
    // add the spherical positions as the first morph target
    circleGeometry.morphAttributes.position[0] = cubeTarget1.getAttribute('position');
    // var m1 = new THREE.Matrix4();
    // m1.lookAt(new THREE.Vector3(   0,0 ,0),new THREE.Vector3(   0,0 ,-1),new THREE.Vector3(   0, 1 ,0));
    // m1.setPosition(v);
    // circleGeometry.applyMatrix(m1);
    var circle = new THREE.Mesh(circleGeometry, material);
    circle.userData.sign = 0.01;
    circle.morphTargetInfluences[0] = 0.01;
    circle.position.set(v.x, v.y, v.z);
    circle.castShadow = true;
    this.scene.add(circle);
    //circleGeometry.addEventListener
  }

  isdestory = false;
  ngOnDestroy(): void {
    this.isdestory=true;
  }

  animate() {
    if(this.isdestory) return;
    requestAnimationFrame(() => this.animate());
    this.animateSphere();
    this.renderer.render(this.scene, this.camera);
    this.xyz.renderer(this.renderer);
  }

  animateSphere() {
    for (var i = this.scene.children.length - 1; i > -1; i--) {
      const object = <THREE.Mesh>this.scene.children[i];
      if (object.geometry instanceof THREE.SphereBufferGeometry) {
        object.morphTargetInfluences[0] += object.userData.sign;
        if (object.morphTargetInfluences[0] <= 0 || object.morphTargetInfluences[0] >= 1) {
          object.userData.sign = - object.userData.sign;
        }
      }
    }
  }

  contextmenu(e: MouseEvent) {
    e.cancelBubble = true
    e.returnValue = false;
    return false;
  }
}
