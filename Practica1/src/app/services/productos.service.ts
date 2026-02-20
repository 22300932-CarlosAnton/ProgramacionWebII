import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Producto } from '../models/producto.model';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  getAll(): Observable<Producto[]> {
    // En SSR (servidor) NO llamamos al XML para evitar errores,
    // solo cuando corre en el navegador.
    if (!isPlatformBrowser(this.platformId)) {
      return of([]);
    }

    // productos.xml ahora está en la carpeta "public"
    return this.http
      .get('/productos.xml', { responseType: 'text' })
      .pipe(map((xmlText) => this.parseProductsXml(xmlText)));
  }

  private parseProductsXml(xmlText: string): Producto[] {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlText, 'application/xml');

    if (doc.getElementsByTagName('parsererror').length > 0) {
      console.error('XML mal formado:', xmlText);
      return [];
    }

    const nodes = Array.from(doc.getElementsByTagName('producto'));

    const productos = nodes.map((node) => ({
      id: this.getNumber(node, 'id'),
      nombre: this.getText(node, 'nombre'),
      precio: this.getNumber(node, 'precio'),
      imagenUrl: this.getText(node, 'imagenUrl'),
      categoria: this.getText(node, 'categoria'),
      descripcion: this.getText(node, 'descripcion'),
      enStock: this.getBoolean(node, 'enStock'),
    }));

    console.log('Productos parseados desde XML:', productos);
    return productos;
  }

  private getText(parent: Element, tag: string): string {
    return parent.getElementsByTagName(tag)[0]?.textContent?.trim() ?? '';
  }

  private getNumber(parent: Element, tag: string): number {
    const value = this.getText(parent, tag);
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  private getBoolean(parent: Element, tag: string): boolean {
    const value = this.getText(parent, tag).toLowerCase();
    return value === 'true' || value === '1' || value === 'yes';
  }
}
