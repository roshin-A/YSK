				SELECT 
			COM_SLNO AS id,
			CASE 
				WHEN com_desc = 'Held by Company' THEN 'With Company'
				WHEN com_desc = 'Issued To Employee' THEN 'With Employee'
				ELSE com_desc
			END AS name
		FROM COMMONCODES com
		JOIN CODETYPES cod ON com.COM_TYPE = cod.COD_CODE
		WHERE cod.COD_DESC = 'Document Held Details';
	



		select * from COMMONCODES where COM_DESC = 'With Employee'

		
		select * from COMMONCODES where COM_DESC = 'Issued To Employee'

		select * from CODETYPES where COD_CODE = 221

		select * from CODETYPES where COD_CODE = 222