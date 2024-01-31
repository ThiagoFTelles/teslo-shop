import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService
  ) {}

  async runSeed() {
    this.insertNewProducts()
    return 'Seed executed'
  }

  private async insertNewProducts() {
    await this.productsService.deleteAllproducts()

    const products = initialData.products
    const insertPromisses = []

    products.forEach( product => {
      insertPromisses.push( this.productsService.create( product ) )
    } )

    await Promise.all( insertPromisses )

    return true
  }
}
