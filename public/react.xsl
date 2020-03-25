<?xml version="1.0" encoding="windows-1252"?>
<xsl:stylesheet 
  version="1.0" 
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
>
<!--
select uscsxsl.apply
(
	'<root/>',
	'c:\xmltest\react.xsl',
	'document:tables', usmeta.tables()
)
-->
<xsl:param name="tables"/>

<xsl:output method="text" encoding="UTF-8" omit-xml-declaration="yes"/>

<xsl:template match="/">
	<xsl:call-template name="head"/>
	<xsl:apply-templates mode="tables" select="$tables/Meta/Tables/Table"/>
	<xsl:call-template name="footer"/>
</xsl:template>

<xsl:template name="head">
<xsl:text>{</xsl:text>
<xsl:text>&#10;</xsl:text>
</xsl:template>

<xsl:template name="footer">
<xsl:text>&#10;</xsl:text>
<xsl:text>}</xsl:text>
</xsl:template>

<xsl:template mode="tables" match="Table">
	<xsl:text>"</xsl:text>
	<xsl:value-of select="@TABLE_NAME"/>
	<xsl:text>"</xsl:text>
	<xsl:text>: { &#10;</xsl:text>
	<xsl:variable name="sql">
		<xsl:text>select usmeta.columns('</xsl:text>
		<xsl:value-of select="@TABLE_NAME"/>
		<xsl:text>')</xsl:text>
	</xsl:variable>
	<xsl:apply-templates mode="columns" select="document($sql)/Meta/Columns/Column"/>
	<xsl:text>} &#10;</xsl:text>	
	<xsl:if test="not(position() = last())">,</xsl:if>
</xsl:template>

<!-- example of fields avaibable:
TABLE_NAME="SOMENUMBERS" COLUMN_NAME="KEYVALUE" TABLE_MODULE="RDMI91" PRIMARY_KEY="Y" FOREIGN_KEY="N" MANDATORY="Y" INPUT_ALLOWED="Y" QUERY_ALLOWED="Y" UPDATABLE="Y" DISPLAYED="Y" INTERFACE="N" DEF_VALUE="" COLUMN_TYPE="DATABASE" PROMPT="key" COLUMN_HELP_TEXT="" DOMAIN_NAME="TWI_INT_8" DATATYPE="NUMBER" TOTAL_LENGTH="8" LENGTH_AFTER_PERIOD="0" DISPLAY_DATATYPE="INT" DISPLAY_LENGTH="0" DISPLAY_LENGTH_AFTER_PERIOD="0" UPPERCASE="N" FIXED_LENGTH="N" IS_SEQNO="N" UNICODE_TYPE="N" RANGE_LOW="" RANGE_HIGH="" DOMAIN_HELP_TEXT="" REG_EXP="" DOMAIN_MODULE="RDMI91" IO_FORMAT=""
-->
<xsl:template mode="columns" match="Column">
	<xsl:text>"</xsl:text>
	<xsl:value-of select="@COLUMN_NAME"/>
	<xsl:text>": {&#10; "TYPE": "</xsl:text>
	<xsl:value-of select="@DATATYPE"/>
	<xsl:text>", "PK": "</xsl:text>
	<xsl:value-of select="@PRIMARY_KEY"/>
	<xsl:text>" &#10; }</xsl:text>
	<xsl:if test="not(position() = last())">, &#10;</xsl:if>
</xsl:template>

</xsl:stylesheet>
