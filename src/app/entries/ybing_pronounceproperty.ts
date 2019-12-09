import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from 'typeorm';
import {ybing_worditem} from './ybing_worditem';

@Entity()
export class ybing_pronounceproperty {
    @PrimaryGeneratedColumn({type: 'integer'})
    id: number;

    @Column({type: 'varchar', length: 8})
    type: string;

    @Column({type: 'text'})
    text: string ;

    @Column({type: 'varchar', length: 16})
    mime: string;

    @Column({type: 'text'})
    voice: string;

    @ManyToOne(type => ybing_worditem, word => word.pronounces)
    @JoinColumn({name: 'word_id'})
    word: ybing_worditem;
}
