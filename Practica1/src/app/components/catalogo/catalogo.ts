import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductsService } from '../../services/productos.service';
import { ProductCardComponent } from '../product-card/product-card';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [ProductCardComponent],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.css'],
})
export class CatalogoComponent {
  private productosService = inject(ProductsService);

  products = toSignal(this.productosService.getAll(), { initialValue: [] });
}
