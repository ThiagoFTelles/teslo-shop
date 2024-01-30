import { Injectable } from '@nestjs/common';
import { ProductsService } from './../products/products.service';

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
    return true
  }
}
