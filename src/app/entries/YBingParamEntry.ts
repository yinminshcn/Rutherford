import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn} from 'typeorm';

@Entity()
export class YBingParamEntry {
    @PrimaryGeneratedColumn({type: 'integer'})
    id: number;

    /// when extra is 0, mean config
    /// when extra is 1, mean history
    /// when extra is 2, mean mark

    @Column({type: 'integer'})
    extra: number;

    @Column({type: 'text'})
    text: string ;

    @CreateDateColumn()
    createdDate: Date;

}
