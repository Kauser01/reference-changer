import ReferenceChanger from './ReferenceChanger';

const referenceChanger = (resource: string, source: string, destination: string) => {
  const changer = new ReferenceChanger(resource, source, destination);
  changer.changeReference();
}

export default referenceChanger;