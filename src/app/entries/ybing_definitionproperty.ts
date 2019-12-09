import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from 'typeorm';
import {ybing_worditem} from './ybing_worditem';

@Entity()
export class ybing_definitionproperty {
    @PrimaryGeneratedColumn({type: 'integer'})
    id: number;

    @Column({type: 'varchar', length: 32})
    type: string;

    @Column({type: 'text'})
    text: string ;

    @ManyToOne(type => ybing_worditem, word => word.definitions)
    @JoinColumn({name: 'word_id'})
    word: ybing_worditem;
}
