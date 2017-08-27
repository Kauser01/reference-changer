import * as winston from 'winston';
import ReferenceChanger from './ReferenceChanger';
 
let changer = new ReferenceChanger(process.cwd(), process.argv[2], process.argv[3]);

changer.changeReference();
