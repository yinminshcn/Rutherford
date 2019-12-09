import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from 'typeorm';
import {ybing_worditem} from './ybing_worditem';

@Entity()
export class ybing_imageproperty {
    @PrimaryGeneratedColumn({type: 'integer'})
    id: number;

    @Column({type: 'varchar', length: 16})
    mime: string;

    @Column({type: 'text'})
    image: string;

    @ManyToOne(type => ybing_worditem, word => word.images)
    @JoinColumn({name: 'word_id'})
    word: ybing_worditem;
}
