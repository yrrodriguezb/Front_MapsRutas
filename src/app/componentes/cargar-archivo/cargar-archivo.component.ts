import { Component, OnInit, ViewChild } from '@angular/core';
import { GooglemapsService } from 'src/app/servicios';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cargar-archivo',
  templateUrl: './cargar-archivo.component.html',
  styleUrls: ['./cargar-archivo.component.css']
})
export class CargarArchivoComponent implements OnInit {

  @ViewChild('inputFile') inputFile;
  archivo: any;
  nombreArchivo = 'Archivo no seleccionado...';
  info: any;
  constructor(
    private googlemapsService: GooglemapsService
  ) { }

  ngOnInit() {
  }

  leerArchivo(event: any) {
    if (!event.target.files) {
      alert('No se ha seleccionado archivo');
    }

    const ArchivosPermitidos = ['text/plain'];
    this.archivo = event.target.files[0];
    this.nombreArchivo = this.archivo.name;

    if (ArchivosPermitidos.indexOf(this.archivo.type) === -1) {
      alert('El tipo de archivo no es permitido');
      this.nombreArchivo = 'Archivo no seleccionado...';
      return;
    }

    const reader = new FileReader();

    reader.onload = (e: any) => {
      const lineas = e.target.result.split('\n');
      this.setLocalStorage(lineas);
    };

    reader.readAsText(this.archivo);

  }

  setLocalStorage(arrayLineas: any[]) {
    localStorage.setItem('coordenadas', JSON.stringify(arrayLineas));
    this.obtenerDatosApi();
  }

  cleanLocalStorage() {
    localStorage.removeItem('coordenadas');
  }

  getDataLocalStorage() {
    return JSON.parse(localStorage.getItem('coordenadas'));
  }

  obtenerDatosApi() {
    const data = this.getDataLocalStorage();
    if (Array.isArray(data)) {

      let arr = this.obtenerOrigenesAPI(data);
      let subscriptions: Subscription

      arr.forEach((coord: any) => {
        let suscription = this.googlemapsService.getData(coord)
          .subscribe((data: any) => {
            console.log(data);
          }, (err: any) => {
            console.error(err);
          }, () => {
            console.log('Fin');
          });

        subscriptions.add(suscription);
      })


      setTimeout(() => {
        subscriptions.unsubscribe();
      }, 5000);
    }
  }

  private obtenerOrigenesAPI(lineas: any[]) {
    let arr = [];
    var o = {};
    let add = false;

    lineas.forEach((value) => {
      if (value) {
        let linea = value.split('\t');

        if (!o['origen']) {
          o['origen'] = linea[0];
          o['destinos'] = linea[1];
          add = true;
        } else {
          if (o['origen'] == linea[0]) {
            o['destinos'] = o['destinos'] + '|' + linea[1];
            add = false;
          } else {
            o = {};
            o['origen'] = linea[0];
            o['destinos'] = linea[1];
            add = true;
          }
        }

        if (add) {
          arr.push(o)
        }
      }
    })

    return arr;
  }
}
