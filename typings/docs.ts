export interface Docs {
	id: number;
	name: string;
	kind: number;
	kindString: string;
	flags: GetSignatureFlags;
	originalName: string;
	children: DocsChild[];
	groups: Group[];
	sources: Source[];
}

export interface DocsChild {
	id: number;
	name: string;
	kind: number;
	kindString: TentacledKindString;
	flags: GetSignatureFlags;
	children?: PurpleChild[];
	groups?: Group[];
	sources: Source[];
	comment?: PurpleComment;
	extendedTypes?: ExtendedType[];
	type?: FriskyType;
	typeParameters?: ChildTypeParameter[];
	signatures?: DeclarationElement[];
}

export interface PurpleChild {
	id: number;
	name: string;
	kind: number;
	kindString: PurpleKindString;
	flags: PurpleFlags;
	sources: Source[];
	target?: number;
	comment?: GetSignatureComment;
	type?: AmbitiousType;
	defaultValue?: string;
	signatures?: PurpleSignature[];
	getSignature?: GetSignature;
	inheritedFrom?: InheritedFrom;
	overwrites?: InheritedFrom;
}

export interface GetSignatureComment {
	summary: ContentElement[];
}

export interface ContentElement {
	kind: Kind;
	text: string;
}

export enum Kind {
	Code = "code",
	InlineTag = "inline-tag",
	Text = "text",
}

export interface PurpleFlags {
	isConst?: boolean;
	isPrivate?: boolean;
	isPublic?: boolean;
	isStatic?: boolean;
	isExternal?: boolean;
	isReadonly?: boolean;
	isOptional?: boolean;
}

export interface GetSignature {
	id: number;
	name: string;
	kind: number;
	kindString: GetSignatureKindString;
	flags: GetSignatureFlags;
	type: ExtendedType;
	comment?: GetSignatureComment;
}

export interface GetSignatureFlags {}

export enum GetSignatureKindString {
	GetSignature = "Get signature",
}

export interface ExtendedType {
	type: TypeEnum;
	id?: number;
	typeArguments?: ExtendedTypeTypeArgument[];
	name: string;
	qualifiedName?: string;
	package?: Package;
}

export enum Package {
	DiscordAPITypes = "discord-api-types",
	DiscordJS = "discord.js",
	TsResults = "ts-results",
	TypesNode = "@types/node",
	Typescript = "typescript",
}

export enum TypeEnum {
	Array = "array",
	IndexedAccess = "indexedAccess",
	Inferred = "inferred",
	Intersection = "intersection",
	Intrinsic = "intrinsic",
	Literal = "literal",
	Mapped = "mapped",
	Query = "query",
	Reference = "reference",
	Reflection = "reflection",
	Tuple = "tuple",
	TypeOperator = "typeOperator",
	Union = "union",
}

export interface ExtendedTypeTypeArgument {
	type: TypeEnum;
	name?: string;
	qualifiedName?: string;
	package?: Package;
	types?: ExtendsType[];
	typeArguments?: InheritedFrom[];
	id?: number;
}

export interface InheritedFrom {
	type: TypeEnum;
	name: string;
}

export interface ExtendsType {
	type: TypeEnum;
	name?: string;
	qualifiedName?: string;
	package?: Package;
	types?: ExtendsTypeTypeClass[];
	typeArguments?: QueryTypeTypeArgument[];
	value?: string;
	id?: number;
}

export interface QueryTypeTypeArgument {
	type: TypeEnum;
	name?: string;
	qualifiedName?: QualifiedName;
	package?: Package;
	value?: string;
	id?: number;
	typeArguments?: InheritedFrom[];
	types?: InheritedFrom[];
}

export enum QualifiedName {
	CacheType = "CacheType",
	InteractionReplyOptions = "InteractionReplyOptions",
	Result = "Result",
}

export interface ExtendsTypeTypeClass {
	type: TypeEnum;
	name: string;
	qualifiedName?: string;
	package?: Package;
}

export enum PurpleKindString {
	Accessor = "Accessor",
	Constructor = "Constructor",
	EnumerationMember = "Enumeration Member",
	Function = "Function",
	Method = "Method",
	Property = "Property",
	Reference = "Reference",
	Variable = "Variable",
}

export interface PurpleSignature {
	id: number;
	name: string;
	kind: number;
	kindString: FluffyKindString;
	flags: FluffyFlags;
	comment?: PurpleComment;
	typeParameter?: SignatureTypeParameter[];
	parameters?: PurpleParameter[];
	type: HilariousType;
	inheritedFrom?: InheritedFrom;
	overwrites?: InheritedFrom;
}

export interface PurpleComment {
	summary: PurpleSummary[];
	blockTags?: BlockTag[];
}

export interface BlockTag {
	tag: Tag;
	content: ContentElement[];
}

export enum Tag {
	Deprecated = "@deprecated",
	Example = "@example",
	Returns = "@returns",
	Since = "@since",
}

export interface PurpleSummary {
	kind: Kind;
	text: string;
	tag?: string;
	target?: number;
}

export interface FluffyFlags {
	isExternal?: boolean;
}

export enum FluffyKindString {
	CallSignature = "Call signature",
	ConstructorSignature = "Constructor signature",
}

export interface PurpleParameter {
	id: number;
	name: string;
	kind: number;
	kindString: ParameterKindString;
	flags: TentacledFlags;
	comment?: GetSignatureComment;
	type: PurpleType;
	defaultValue?: string;
}

export interface TentacledFlags {
	isExternal?: boolean;
	isOptional?: boolean;
	isRest?: boolean;
}

export enum ParameterKindString {
	Parameter = "Parameter",
}

export interface PurpleType {
	type: TypeEnum;
	id?: number;
	name?: string;
	typeArguments?: ExtendsType[];
	qualifiedName?: string;
	package?: Package;
	types?: ExtendsType[];
	declaration?: PurpleDeclaration;
	indexType?: CheckTypeElement;
	objectType?: CheckTypeElement;
	elementType?: TentacledElementType;
}

export interface PurpleDeclaration {
	id: number;
	name: DeclarationName;
	kind: number;
	kindString: DeclarationKindString;
	flags: FluffyFlags;
	sources: Source[];
	signatures: FluffySignature[];
}

export enum DeclarationKindString {
	CallSignature = "Call signature",
	Property = "Property",
	TypeLiteral = "Type literal",
}

export enum DeclarationName {
	Type = "__type",
}

export interface FluffySignature {
	id: number;
	name: DeclarationName;
	kind: number;
	kindString: FluffyKindString;
	flags: FluffyFlags;
	parameters: FluffyParameter[];
	type: InheritedFrom;
}

export interface FluffyParameter {
	id: number;
	name: string;
	kind: number;
	kindString: ParameterKindString;
	flags: StickyFlags;
	type: FluffyType;
}

export interface StickyFlags {
	isExternal?: boolean;
	isRest: boolean;
}

export interface FluffyType {
	type: TypeEnum;
	elementType: PurpleElementType;
}

export interface PurpleElementType {
	type: TypeEnum;
	name?: string;
	indexType?: CheckTypeElement;
	objectType?: CheckTypeElement;
}

export interface TypeClass {
	type: TypeEnum;
	indexType?: InheritedFrom;
	objectType?: CheckTypeElement;
	name?: string;
	declaration?: DeclarationElement;
}

export interface CheckTypeTypeArgument {
	type: TypeEnum;
	indexType?: ObjectTypeClass;
	objectType?: ObjectTypeClass;
	types?: IndexTypeElement[];
	name?: string;
	id?: number;
	operator?: Operator;
	target?: TypeClass;
}

export interface DeclarationType {
	type: TypeEnum;
	declaration?: DeclarationElement;
	name?: string;
	id?: number;
	elements?: CheckTypeElement[];
	typeArguments?: PurpleTypeArgument[];
	types?: ExtendsType[];
}

export interface FluffyElementType {
	type: TypeEnum;
	declaration: DeclarationElement;
}

export interface IndecentType {
	type: TypeEnum;
	typeArguments?: TentacledTypeArgument[];
	name?: PurpleName;
	qualifiedName?: PurpleName;
	package?: Package;
	elementType?: FluffyElementType;
}

export interface IndigoType {
	type: TypeEnum;
	id?: number;
	name?: string;
	declaration?: DeclarationElement;
	typeArguments?: FluffyTypeArgument[];
	qualifiedName?: string;
	package?: Package;
	indexType?: CheckTypeElement;
	objectType?: ExtendedType;
	elementType?: InheritedFrom;
	elements?: TypeElement[];
}

export interface TentacledParameter {
	id: number;
	name: string;
	kind: number;
	kindString: ParameterKindString;
	flags: IndecentFlags;
	type: IndigoType;
}

export interface SignatureSignature {
	id: number;
	name: DeclarationName;
	kind: number;
	kindString: FluffyKindString;
	flags: GetSignatureFlags;
	type: IndecentType;
	parameters?: TentacledParameter[];
}

export interface PurpleTypeArgument {
	type: TypeEnum;
	indexType?: CheckTypeElement;
	objectType?: InheritedFrom;
	types?: IndexTypeElement[];
}

export interface TentacledType {
	type: TypeEnum;
	name?: string;
	declaration?: DeclarationElement;
	id?: number;
	typeArguments?: PurpleTypeArgument[];
	elementType?: CheckTypeElement;
	value?: boolean;
	types?: ExtendsType[];
	qualifiedName?: string;
	package?: Package;
}

export interface SignatureChild {
	id: number;
	name: string;
	kind: number;
	kindString: PurpleKindString;
	flags: IndigoFlags;
	sources: Source[];
	type: TentacledType;
}

export interface DeclarationElement {
	id: number;
	name: string;
	kind: number;
	kindString: DeclarationKindString;
	flags: GetSignatureFlags;
	sources?: Source[];
	type?: DeclarationType;
	defaultValue?: string;
	signatures?: SignatureSignature[];
	children?: SignatureChild[];
	groups?: Group[];
	comment?: GetSignatureComment;
	parameters?: DeclarationParameter[];
}

export interface CheckTypeElement {
	type: TypeEnum;
	id?: number;
	name?: string;
	elements?: CheckTypeElement[];
	types?: CheckTypeTypeClass[];
	declaration?: DeclarationElement;
	typeArguments?: CheckTypeTypeArgument[];
}

export interface ObjectTypeClass {
	type: TypeEnum;
	id?: number;
	name: string;
}

export enum Operator {
	Keyof = "keyof",
}

export interface IndexTypeElement {
	type: TypeEnum;
	value: string;
}

export enum PurpleName {
	Awaitable = "Awaitable",
	ErrImpl = "ErrImpl",
	OkImpl = "OkImpl",
	Unknown = "unknown",
}

export interface TentacledTypeArgument {
	type: TypeEnum;
	name?: TypeArgumentName;
	typeArguments?: InheritedFrom[];
	qualifiedName?: QualifiedName;
	package?: Package;
	types?: InheritedFrom[];
}

export enum TypeArgumentName {
	Result = "Result",
	Void = "void",
}

export interface TypeElement {
	type: TypeEnum;
	value?: string;
	id?: number;
	name?: string;
	elementType?: InheritedFrom;
}

export interface FluffyTypeArgument {
	type: TypeEnum;
	indexType?: IndexTypeElement;
	objectType?: TypeArgument;
	name?: string;
	types?: IndexTypeElement[];
}

export interface TypeArgument {
	type: TypeEnum;
	indexType?: InheritedFrom;
	objectType?: InheritedFrom;
	types?: IndexTypeElement[];
}

export interface IndecentFlags {
	isRest?: boolean;
}

export interface IndigoFlags {
	isOptional?: boolean;
}

export interface Source {
	fileName: FileName;
	line: number;
	character: number;
	url?: string;
}

export enum FileName {
	NodeModulesDiscordJSTypingsIndexDTs = "node_modules/discord.js/typings/index.d.ts",
	NodeModulesTypesNodeEventsDTs = "node_modules/@types/node/events.d.ts",
	SrcHandlerPluginsPluginTs = "src/handler/plugins/plugin.ts",
	SrcHandlerSernEmitterTs = "src/handler/sernEmitter.ts",
	SrcHandlerSernTs = "src/handler/sern.ts",
	SrcHandlerStructuresContextTs = "src/handler/structures/context.ts",
	SrcHandlerStructuresEnumsTs = "src/handler/structures/enums.ts",
	SrcHandlerStructuresModuleTs = "src/handler/structures/module.ts",
	SrcHandlerStructuresWrapperTs = "src/handler/structures/wrapper.ts",
	SrcIndexTs = "src/index.ts",
	SrcTypesHandlerTs = "src/types/handler.ts",
}

export interface Group {
	title: string;
	children: number[];
}

export interface DeclarationParameter {
	id: number;
	name: string;
	kind: number;
	kindString: ParameterKindString;
	flags: IndecentFlags;
	type: StickyType;
}

export interface StickyType {
	type: TypeEnum;
	id?: number;
	name?: string;
	indexType?: InheritedFrom;
	objectType?: ExtendsType;
}

export interface CheckTypeTypeClass {
	type: TypeEnum;
	name: string;
	qualifiedName?: string;
	package?: Package;
	id?: number;
	typeArguments?: InheritedFrom[];
}

export interface TentacledElementType {
	type: TypeEnum;
	types: ExtendsType[];
}

export interface HilariousType {
	type: TypeEnum;
	name?: string;
	id?: number;
	typeArguments?: StickyTypeArgument[];
	qualifiedName?: string;
	package?: Package;
	elementType?: ExtendsType;
}

export interface StickyTypeArgument {
	type: TypeEnum;
	typeArguments?: InheritedFrom[];
	name?: string;
	qualifiedName?: string;
	package?: Package;
	indexType?: ExtendedType;
	objectType?: ExtendedType;
	elementType?: InheritedFrom;
}

export interface SignatureTypeParameter {
	id: number;
	name: string;
	kind: number;
	kindString: TypeParameterKindString;
	flags: FluffyFlags;
	type: Default;
}

export enum TypeParameterKindString {
	TypeParameter = "Type parameter",
}

export interface Default {
	type: TypeEnum;
	name?: string;
	qualifiedName?: string;
	package?: Package;
	operator?: Operator;
	target?: ExtendedType;
	id?: number;
	declaration?: DeclarationElement;
}

export interface AmbitiousType {
	type: TypeEnum;
	declaration?: FluffyDeclaration;
	value?: number | string;
	queryType?: ExtendsType;
	name?: string;
	typeArguments?: InheritedFrom[];
	qualifiedName?: string;
	package?: Package;
	types?: MagentaType[];
	id?: number;
}

export interface FluffyDeclaration {
	id: number;
	name: DeclarationName;
	kind: number;
	kindString: DeclarationKindString;
	flags: GetSignatureFlags;
	children?: DeclarationElement[];
	groups?: Group[];
	sources: Source[];
	signatures?: TentacledSignature[];
}

export interface TentacledSignature {
	id: number;
	name: DeclarationName;
	kind: number;
	kindString: FluffyKindString;
	flags: GetSignatureFlags;
	type: CunningType;
}

export interface CunningType {
	type: TypeEnum;
	typeArguments: InheritedFrom[];
	name: string;
	qualifiedName: string;
	package: Package;
}

export interface MagentaType {
	type: TypeEnum;
	name?: string;
	elementType?: FluffyElementType;
	declaration?: DeclarationElement;
}

export enum TentacledKindString {
	Class = "Class",
	Enumeration = "Enumeration",
	Function = "Function",
	Interface = "Interface",
	Namespace = "Namespace",
	TypeAlias = "Type alias",
}

export interface FriskyType {
	type: string;
	id?: number;
	typeArguments?: IndecentTypeArgument[];
	name?: TemplateTypeName;
	types?: MischievousType[];
	parameter?: string;
	parameterType?: IndexType;
	templateType?: PurpleTemplateType;
	indexType?: IndexType;
	objectType?: TypeObjectType;
	declaration?: TentacledDeclaration;
	optionalModifier?: string;
	checkType?: CheckTypeElement;
	extendsType?: ExtendsType;
	trueType?: CheckTypeElement;
	falseType?: FalseType;
	qualifiedName?: TemplateTypeName;
	package?: Package;
}

export interface TentacledDeclaration {
	id: number;
	name: DeclarationName;
	kind: number;
	kindString: DeclarationKindString;
	flags: GetSignatureFlags;
	children?: DeclarationElement[];
	groups?: Group[];
	sources: Source[];
	signatures?: DeclarationElement[];
}

export interface FalseType {
	type: string;
	id?: number;
	name?: string;
	checkType?: CheckTypeElement;
	extendsType?: ExtendedType;
	trueType?: CheckTypeElement;
	falseType?: CheckTypeElement;
}

export interface IndexType {
	type: TypeEnum;
	id?: number;
	name?: string;
	operator?: Operator;
	target?: CheckTypeElement;
}

export enum TemplateTypeName {
	DefinitelyDefined = "DefinitelyDefined",
	Omit = "Omit",
	Override = "Override",
	ParseType = "ParseType",
}

export interface TypeObjectType {
	type: TypeEnum;
	parameter: string;
	parameterType: IndexType;
	templateType: ObjectTypeTemplateType;
}

export interface ObjectTypeTemplateType {
	type: string;
	id?: number;
	typeArguments?: IndigoTypeArgument[];
	name?: TemplateTypeName;
	types?: TypeClass[];
	checkType?: TypeClass;
	extendsType?: InheritedFrom;
	trueType?: TrueType;
	falseType?: InheritedFrom;
}

export interface TrueType {
	type: TypeEnum;
	elements: TrueTypeElement[];
}

export interface TrueTypeElement {
	type: string;
	name: string;
	isOptional: boolean;
	element: TypeClass;
}

export interface IndigoTypeArgument {
	type: TypeEnum;
	name?: string;
	declaration?: DeclarationElement;
}

export interface PurpleTemplateType {
	type: string;
	typeArguments?: TypeArgument[];
	name?: TemplateTypeName;
	qualifiedName?: TemplateTypeName;
	package?: Package;
	checkType?: TypeClass;
	extendsType?: ExtendsTypeClass;
	trueType?: EType;
	falseType?: EType;
}

export interface ExtendsTypeClass {
	type: TypeEnum;
	indexType: InheritedFrom;
	objectType: ExtendsTypeObjectType;
}

export interface ExtendsTypeObjectType {
	type: TypeEnum;
	typeArguments: CheckTypeElement[];
	name: string;
	qualifiedName: string;
	package: Package;
}

export interface EType {
	type: TypeEnum;
	value: boolean;
}

export interface IndecentTypeArgument {
	type: TypeEnum;
	declaration?: DeclarationElement;
	name?: string;
	types?: IndexTypeElement[];
	id?: number;
	qualifiedName?: string;
	package?: Package;
	typeArguments?: ExtendsType[];
}

export interface MischievousType {
	type: TypeEnum;
	name?: string;
	qualifiedName?: string;
	package?: Package;
	id?: number;
	typeArguments?: IndexType[];
	parameter?: string;
	parameterType?: CheckTypeElement;
	templateType?: FluffyTemplateType;
	optionalModifier?: string;
	elementType?: FluffyElementType;
	declaration?: DeclarationElement;
	indexType?: CheckTypeElement;
	objectType?: CheckTypeElement;
	value?: null;
}

export interface FluffyTemplateType {
	type: string;
	checkType: TypeClass;
	extendsType: ExtendsType;
	trueType: CheckTypeElement;
	falseType: ExtendsTypeClass;
}

export interface ChildTypeParameter {
	id: number;
	name: string;
	kind: number;
	kindString: TypeParameterKindString;
	flags: GetSignatureFlags;
	type?: Default;
	default?: Default;
}
