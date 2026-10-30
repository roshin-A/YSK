SELECT * FROM HRM_EMP_DOC  where DOC_EMP_MASTER_PR = 376
select * from HRM_EMP_MASTER where EMP_Name = 'RAKELLE  AYOUB'

SELECT * FROM COMMONCODES WHERE COM_SLNO = '13321'

select * from HRM_EMP_MASTER where EMP_Slno = 5


UPDATE D
SET
    D.DOC_NO = P.[Document No.],
    D.DOC_ISSUE_DATE = TRY_CONVERT(DATE, P.[Issue Date]),
    D.DOC_EXP_DATE = TRY_CONVERT(DATE, P.[Expiry Date]),
    D.DOC_ENABLE_DOC_HOLD = CC.COM_SLNO
FROM HRM_EMP_DOC D
INNER JOIN HRM_EMP_MASTER E
    ON D.DOC_EMP_MASTER_PR = E.EMP_SLNO
INNER JOIN Passport_Release_Process P
    ON E.EMP_Code = P.[Emp ID]
INNER JOIN COMMONCODES C
    ON C.COM_DESC = P.[Document Type]
INNER JOIN COMMONCODES CC
    ON CC.COM_DESC = CASE
        WHEN P.[Document Custodian] = 'With Company'
            THEN 'Held by Company'
        WHEN P.[Document Custodian] = 'With Employee'
            THEN 'Issued To Employee'
        ELSE P.[Document Custodian]
    END
INNER JOIN CODETYPES CT
    ON CC.COM_TYPE = CT.COD_CODE
    AND CT.COD_DESC = 'Document Held Details'
WHERE D.DOC_TYPE_DR = C.COM_SLNO;