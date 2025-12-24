export const getImagingUrl = (differentialName: string): string => {
  const searchTerm = differentialName.toLowerCase();
  let query = '';

  // Specific cases for better results from unsplash
  if (searchTerm.includes('myocardial infarction')) query = 'ecg heart attack';
  else if (searchTerm.includes('pneumonia')) query = 'pneumonia chest xray';
  else if (searchTerm.includes('aortic dissection')) query = 'aortic dissection ct scan';
  else if (searchTerm.includes('pulmonary embolism')) query = 'pulmonary embolism ct angiogram';
  else if (searchTerm.includes('pneumothorax')) query = 'pneumothorax chest xray';
  else if (searchTerm.includes('bowel obstruction')) query = 'bowel obstruction abdominal xray';
  else if (searchTerm.includes('appendicitis')) query = 'appendicitis ct scan abdomen';
  else if (searchTerm.includes('cholecystitis')) query = 'cholecystitis gallbladder ultrasound';
  else if (searchTerm.includes('stroke')) query = 'brain stroke ct scan';
  else if (searchTerm.includes('hemorrhage')) query = 'subarachnoid hemorrhage brain ct';
  else if (searchTerm.includes('fracture')) query = `${searchTerm} xray`;
  else if (searchTerm.includes('meningitis')) query = 'lumbar puncture procedure';
   else if (searchTerm.includes('arthritis')) query = 'joint xray arthritis';
  else query = `${searchTerm} medical imaging`;

  // Use a generic, high-resolution source for placeholder images
  return `https://source.unsplash.com/800x600/?${encodeURIComponent(query)}`;
};
