import React from 'react';
import { A4CertificatePrint } from './A4CertificatePrint';
import { JewelryCertificate } from '../../types';

interface CertificatePrintModalProps {
  certificate: JewelryCertificate;
  onClose: () => void;
}

export const CertificatePrintModal: React.FC<CertificatePrintModalProps> = ({
  certificate,
  onClose,
}) => {
  return <A4CertificatePrint certificate={certificate} onClose={onClose} />;
};
