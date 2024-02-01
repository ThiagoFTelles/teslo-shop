import { BeforeInsert, BeforeUpdate, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from './';

@Entity({ name: 'products' }) // Change table name
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column('text', {
        unique: true,
    })
    title: string

    @Column('float', {
        default: 0,
    })
    price: number

    @Column('text', {
        nullable: true,
    })
    description: string

    @Column('text', {
        unique: true,
    })
    slug: string

    @Column('int', {
        default: 0,
    })
    stock: number

    @Column('text', {
        array: true,
    })
    sizes: string[]

    @Column('text')
    category: string

    @Column('text', {
        array: true,
        default: []
    })
    tags: string[]

    // images
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[]

    @BeforeInsert()
    @BeforeUpdate()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.title
          }
        this.slug = this.slug
        .toLowerCase()
        .replaceAll(" ", "-")
        .replaceAll("'", "")
        .replaceAll('"', "")
    }
}
