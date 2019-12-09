import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn} from 'typeorm';
import {ybing_worditem} from './ybing_worditem';

@Entity()
export class ybing_sentenceproperty {
    @PrimaryGeneratedColumn({type: 'integer'})
    id: number;

    @Column({type: 'text'})
    engString: string;

    @Column({type: 'text'})
    chnString: string ;

    @Column({type: 'varchar', length: 16})
    mime: string;

    @Column({type: 'text'})
    engVoice: string;

    @ManyToOne(type => ybing_worditem, word => word.sentences)
    @JoinColumn({name: 'word_id'})
    word: ybing_worditem;
}
