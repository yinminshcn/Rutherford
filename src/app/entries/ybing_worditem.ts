import {Entity, PrimaryGeneratedColumn, Column, OneToMany, RelationId} from 'typeorm';
import {ybing_sentenceproperty} from './ybing_sentenceproperty';
import {ybing_definitionproperty} from './ybing_definitionproperty';
import {ybing_imageproperty} from './ybing_imageproperty';
import {ybing_pronounceproperty} from './ybing_pronounceproperty';

@Entity()
export class ybing_worditem {
    @PrimaryGeneratedColumn({type: 'integer'})
    id: number;

    @Column({type: 'varchar', length: 32})
    word: string;

    @Column({type: 'integer'})
    extra: number;

    @Column({type: 'integer'})
    group: number;

    // @Column({nullable: true})
    // sentencesId: number[];
    //
    // @Column({nullable: true})
    // definitionsId: number[];
    //
    // @Column({nullable: true})
    // imagesId: number[];
    //
    // @Column({nullable: true})
    // pronouncesId: number[];

    @OneToMany(type => ybing_sentenceproperty, sentence => sentence.word)
    sentences: ybing_sentenceproperty[];

    @OneToMany(type => ybing_definitionproperty, definition => definition.word)
    definitions: ybing_definitionproperty[];

    @OneToMany(type => ybing_imageproperty, image => image.word)
    images: ybing_imageproperty[];

    @OneToMany(type => ybing_pronounceproperty, pronounce => pronounce.word)
    pronounces: ybing_pronounceproperty[];

    @RelationId((word: ybing_worditem) => word.sentences)
    sentenceIds: number[];

    @RelationId((word: ybing_worditem) => word.definitions)
    definitionIds: number[];

    @RelationId((word: ybing_worditem) => word.images)
    imageIds: number[];

    @RelationId((word: ybing_worditem) => word.pronounces)
    pronounceIds: number[];
}
