import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ApiProperty } from "@nestjs/swagger";

import { User } from "../../auth/entities/user.entity";

import { ProductImage } from './';

@Entity({ name: 'products' }) // Change table name
export class Product {
    @ApiProperty({
        example: '05e6a111-e4bb-4bb5-b7d4-490225ed91af',
        description: 'Product ID',
        uniqueItems: true,
    })
    @PrimaryGeneratedColumn('uuid')
    id: string

    @ApiProperty({
        example: 'T-shirt Teslo',
        description: 'Product Title',
        uniqueItems: true,
    })
    @Column('text', {
        unique: true,
    })
    title: string

    @ApiProperty({
        example: 0,
        description: 'Product Price',
    })
    @Column('float', {
        default: 0,
    })
    price: number

    @ApiProperty({
        example: 'Introducing the Tesla Chill Collection.',
        description: 'Product Description',
        default: null,
    })
    @Column('text', {
        nullable: true,
    })
    description: string

    @ApiProperty({
        example: 't_shirt_teslo',
        description: 'Product Slug - for SEO',
        uniqueItems: true,
    })
    @Column('text', {
        unique: true,
    })
    slug: string

    @ApiProperty({
        example: 10,
        description: 'Product stock',
        default: 0,
    })
    @Column('int', {
        default: 0,
    })
    stock: number

    @ApiProperty({
        example: ['S','M','L','XL','XXL'],
        description: 'Product sizes',
    })
    @Column('text', {
        array: true,
    })
    sizes: string[]

    @ApiProperty({
        example: 'women',
        description: 'Product Category',
    })
    @Column('text')
    category: string

    @ApiProperty()
    @Column('text', {
        array: true,
        default: []
    })
    tags: string[]

    // images
    @ApiProperty()
    @OneToMany(
        () => ProductImage,
        (productImage) => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[]

    @ManyToOne(
        () => User,
        ( user ) => user.product,
        { eager: true }
    )
    user: User

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
